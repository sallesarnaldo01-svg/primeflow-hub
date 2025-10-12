import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

export interface CreateContactListData {
  tenantId: string;
  name: string;
  description?: string;
  segmentConditions?: any[];
  autoUpdate?: boolean;
  tags?: string[];
}

export interface UpdateContactListData {
  name?: string;
  description?: string;
  segmentConditions?: any[];
  autoUpdate?: boolean;
  tags?: string[];
}

export const contactListsService = {
  async getContactLists(tenantId: string) {
    const lists = await prisma.$queryRawUnsafe(`
      SELECT 
        cl.*,
        COUNT(DISTINCT clm.id) as member_count
      FROM public.contact_lists cl
      LEFT JOIN public.contact_list_members clm ON cl.id = clm.list_id
      WHERE cl.tenant_id = $1
      GROUP BY cl.id
      ORDER BY cl.created_at DESC
    `, tenantId);

    return lists;
  },

  async getContactListById(id: string, tenantId: string) {
    const list = await prisma.$queryRawUnsafe(`
      SELECT * FROM public.contact_lists 
      WHERE id = $1 AND tenant_id = $2
    `, id, tenantId);

    return list[0];
  },

  async createContactList(data: CreateContactListData) {
    logger.info('Creating contact list', { name: data.name });

    const list = await prisma.$queryRawUnsafe(`
      INSERT INTO public.contact_lists 
        (tenant_id, name, description, segment_conditions, auto_update, tags)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
      data.tenantId,
      data.name,
      data.description,
      JSON.stringify(data.segmentConditions || []),
      data.autoUpdate || false,
      data.tags || []
    );

    return list[0];
  },

  async updateContactList(id: string, tenantId: string, data: UpdateContactListData) {
    const updates = [];
    const values = [id, tenantId];
    let paramIndex = 3;

    if (data.name) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(data.description);
    }
    if (data.segmentConditions) {
      updates.push(`segment_conditions = $${paramIndex++}`);
      values.push(JSON.stringify(data.segmentConditions));
    }
    if (data.autoUpdate !== undefined) {
      updates.push(`auto_update = $${paramIndex++}`);
      values.push(data.autoUpdate);
    }
    if (data.tags) {
      updates.push(`tags = $${paramIndex++}`);
      values.push(data.tags);
    }

    const list = await prisma.$queryRawUnsafe(`
      UPDATE public.contact_lists 
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $1 AND tenant_id = $2
      RETURNING *
    `, ...values);

    return list[0];
  },

  async deleteContactList(id: string, tenantId: string) {
    await prisma.$queryRawUnsafe(`
      DELETE FROM public.contact_lists 
      WHERE id = $1 AND tenant_id = $2
    `, id, tenantId);

    logger.info('Contact list deleted', { listId: id });
  },

  async getListMembers(listId: string, limit: number = 100, offset: number = 0) {
    const members = await prisma.$queryRawUnsafe(`
      SELECT 
        clm.*,
        COALESCE(l.name, c.name) as member_name,
        COALESCE(l.phone, c.phone) as member_phone,
        COALESCE(l.email, c.email) as member_email
      FROM public.contact_list_members clm
      LEFT JOIN public.leads l ON clm.lead_id = l.id
      LEFT JOIN public.contacts c ON clm.contact_id = c.id
      WHERE clm.list_id = $1
      ORDER BY clm.created_at DESC
      LIMIT $2 OFFSET $3
    `, listId, limit, offset);

    return members;
  },

  async addMemberToList(data: {
    listId: string;
    contactId?: string;
    leadId?: string;
    addedBy?: string;
    addedMethod?: 'MANUAL' | 'IMPORT' | 'AUTO_SEGMENT';
  }) {
    const member = await prisma.$queryRawUnsafe(`
      INSERT INTO public.contact_list_members 
        (list_id, contact_id, lead_id, added_by, added_method)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT DO NOTHING
      RETURNING *
    `,
      data.listId,
      data.contactId,
      data.leadId,
      data.addedBy,
      data.addedMethod || 'MANUAL'
    );

    return member[0];
  },

  async removeMemberFromList(listId: string, memberId: string) {
    await prisma.$queryRawUnsafe(`
      DELETE FROM public.contact_list_members 
      WHERE list_id = $1 AND id = $2
    `, listId, memberId);
  },

  async addMembersInBulk(
    listId: string,
    members: Array<{ contactId?: string; leadId?: string }>,
    addedBy?: string
  ) {
    logger.info('Adding members in bulk', { listId, count: members.length });

    const values = members.map((m, i) => {
      const offset = i * 5;
      return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`;
    }).join(', ');

    const params = members.flatMap(m => [
      listId,
      m.contactId || null,
      m.leadId || null,
      addedBy || null,
      'IMPORT'
    ]);

    await prisma.$queryRawUnsafe(`
      INSERT INTO public.contact_list_members 
        (list_id, contact_id, lead_id, added_by, added_method)
      VALUES ${values}
      ON CONFLICT DO NOTHING
    `, ...params);

    return members.length;
  },

  async importFromCSV(listId: string, csvData: any[], addedBy?: string) {
    // Parse CSV data and add to list
    const members = csvData.map(row => ({
      leadId: row.leadId,
      contactId: row.contactId
    }));

    return this.addMembersInBulk(listId, members, addedBy);
  },

  async exportToCSV(listId: string) {
    const members = await this.getListMembers(listId, 10000);

    const headers = ['ID', 'Nome', 'Telefone', 'Email', 'Adicionado em'];
    const rows = members.map((m: any) => [
      m.lead_id || m.contact_id,
      m.member_name,
      m.member_phone || '',
      m.member_email || '',
      new Date(m.created_at).toLocaleDateString('pt-BR')
    ]);

    return { headers, rows };
  },

  async duplicateList(id: string, tenantId: string, newName: string) {
    const originalList = await this.getContactListById(id, tenantId);
    
    if (!originalList) {
      throw new Error('List not found');
    }

    // Create new list
    const newList = await this.createContactList({
      tenantId,
      name: newName,
      description: originalList.description,
      segmentConditions: originalList.segment_conditions,
      autoUpdate: originalList.auto_update,
      tags: originalList.tags
    });

    // Copy members
    await prisma.$queryRawUnsafe(`
      INSERT INTO public.contact_list_members (list_id, contact_id, lead_id, added_method)
      SELECT $1, contact_id, lead_id, 'MANUAL'
      FROM public.contact_list_members
      WHERE list_id = $2
    `, newList.id, id);

    return newList;
  },

  async updateAutoSegmentLists(tenantId: string) {
    // Get all auto-update lists
    const autoLists = await prisma.$queryRawUnsafe(`
      SELECT * FROM public.contact_lists 
      WHERE tenant_id = $1 AND auto_update = TRUE
    `, tenantId);

    for (const list of autoLists as any[]) {
      // Evaluate segment conditions and update members
      // This is a simplified version - in production, you'd evaluate complex conditions
      logger.info('Updating auto-segment list', { listId: list.id });
      
      // Example: Add all leads with specific tags
      const conditions = list.segment_conditions || [];
      
      // Implementation would depend on your segmentation logic
    }
  }
};
