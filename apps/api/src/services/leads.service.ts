import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

export interface LeadFilter {
  tenantId: string;
  status?: string;
  origin?: string;
  ownerId?: string;
  search?: string;
  tags?: string[];
  minScore?: number;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface CreateLeadData {
  tenantId: string;
  name: string;
  phone?: string;
  email?: string;
  origin?: string;
  status?: string;
  ownerId?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface UpdateLeadData {
  name?: string;
  phone?: string;
  email?: string;
  status?: string;
  ownerId?: string;
  tags?: string[];
  score?: number;
  customFields?: Record<string, any>;
  metadata?: Record<string, any>;
}

export const leadsService = {
  async getLeads(filters: LeadFilter) {
    const { tenantId, status, origin, ownerId, search, tags, minScore, dateFrom, dateTo } = filters;

    const where: any = { tenantId };

    if (status) where.status = status;
    if (origin) where.origin = origin;
    if (ownerId) where.ownerId = ownerId;
    if (minScore !== undefined) where.score = { gte: minScore };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    const leads = await prisma.$queryRawUnsafe(`
      SELECT * FROM public.leads 
      WHERE tenant_id = $1
      ${status ? 'AND status = $2' : ''}
      ORDER BY created_at DESC
    `, tenantId, status);

    return leads;
  },

  async getLeadById(id: string, tenantId: string) {
    const lead = await prisma.$queryRawUnsafe(`
      SELECT * FROM public.leads 
      WHERE id = $1 AND tenant_id = $2
    `, id, tenantId);

    return lead[0];
  },

  async createLead(data: CreateLeadData) {
    logger.info('Creating lead', { name: data.name });

    const lead = await prisma.$queryRawUnsafe(`
      INSERT INTO public.leads 
        (tenant_id, name, phone, email, origin, status, owner_id, tags, custom_fields, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, 
      data.tenantId,
      data.name,
      data.phone,
      data.email,
      data.origin || 'MANUAL',
      data.status || 'NEW',
      data.ownerId,
      data.tags || [],
      JSON.stringify(data.customFields || {}),
      JSON.stringify(data.metadata || {})
    );

    // Create status history
    await this.addStatusHistory({
      leadId: lead[0].id,
      toStatus: data.status || 'NEW',
      changedBy: data.ownerId
    });

    logger.info('Lead created successfully', { leadId: lead[0].id });
    return lead[0];
  },

  async updateLead(id: string, tenantId: string, data: UpdateLeadData) {
    const currentLead = await this.getLeadById(id, tenantId);
    
    if (!currentLead) {
      throw new Error('Lead not found');
    }

    // If status changed, record in history
    if (data.status && data.status !== currentLead.status) {
      await this.addStatusHistory({
        leadId: id,
        fromStatus: currentLead.status,
        toStatus: data.status,
        changedBy: data.ownerId
      });
    }

    const updates = [];
    const values = [id, tenantId];
    let paramIndex = 3;

    if (data.name) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.phone) {
      updates.push(`phone = $${paramIndex++}`);
      values.push(data.phone);
    }
    if (data.email) {
      updates.push(`email = $${paramIndex++}`);
      values.push(data.email);
    }
    if (data.status) {
      updates.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }
    if (data.ownerId) {
      updates.push(`owner_id = $${paramIndex++}`);
      values.push(data.ownerId);
    }
    if (data.tags) {
      updates.push(`tags = $${paramIndex++}`);
      values.push(data.tags);
    }
    if (data.score !== undefined) {
      updates.push(`score = $${paramIndex++}`);
      values.push(data.score);
    }

    const lead = await prisma.$queryRawUnsafe(`
      UPDATE public.leads 
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $1 AND tenant_id = $2
      RETURNING *
    `, ...values);

    return lead[0];
  },

  async deleteLead(id: string, tenantId: string) {
    await prisma.$queryRawUnsafe(`
      DELETE FROM public.leads 
      WHERE id = $1 AND tenant_id = $2
    `, id, tenantId);

    logger.info('Lead deleted', { leadId: id });
  },

  async addStatusHistory(data: {
    leadId: string;
    fromStatus?: string;
    toStatus: string;
    changedBy?: string;
    reason?: string;
  }) {
    await prisma.$queryRawUnsafe(`
      INSERT INTO public.lead_status_history 
        (lead_id, from_status, to_status, changed_by, reason)
      VALUES ($1, $2, $3, $4, $5)
    `, data.leadId, data.fromStatus, data.toStatus, data.changedBy, data.reason);
  },

  async getLeadMessages(leadId: string, limit: number = 50) {
    const messages = await prisma.$queryRawUnsafe(`
      SELECT * FROM public.lead_messages 
      WHERE lead_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `, leadId, limit);

    return messages;
  },

  async addLeadMessage(data: {
    leadId: string;
    direction: 'IN' | 'OUT';
    content: string;
    channel: string;
    senderType: 'customer' | 'ai_agent' | 'human_agent' | 'system';
    senderId?: string;
    senderName?: string;
    metadata?: Record<string, any>;
  }) {
    const message = await prisma.$queryRawUnsafe(`
      INSERT INTO public.lead_messages 
        (lead_id, direction, content, channel, sender_type, sender_id, sender_name, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
      data.leadId,
      data.direction,
      data.content,
      data.channel,
      data.senderType,
      data.senderId,
      data.senderName,
      JSON.stringify(data.metadata || {})
    );

    return message[0];
  },

  async calculateScore(leadId: string, tenantId: string) {
    // Get scoring rules
    const rules = await prisma.$queryRawUnsafe(`
      SELECT * FROM public.lead_scoring_rules 
      WHERE tenant_id = $1 AND active = TRUE 
      ORDER BY priority DESC
    `, tenantId);

    let totalScore = 0;

    // Simple scoring logic - can be enhanced
    for (const rule of rules as any[]) {
      totalScore += rule.points;
    }

    // Update lead score
    await prisma.$queryRawUnsafe(`
      UPDATE public.leads 
      SET score = $1, updated_at = NOW() 
      WHERE id = $2
    `, totalScore, leadId);

    return totalScore;
  },

  async distributeLeads(tenantId: string, method: 'round_robin' | 'territory' = 'round_robin') {
    // Get unassigned leads
    const unassignedLeads = await prisma.$queryRawUnsafe(`
      SELECT * FROM public.leads 
      WHERE tenant_id = $1 AND owner_id IS NULL 
      ORDER BY created_at ASC
    `, tenantId);

    // Get available agents (simplified - in production, query from user_roles)
    const agents = await prisma.$queryRawUnsafe(`
      SELECT ur.user_id 
      FROM public.user_roles ur
      WHERE ur.role IN ('admin', 'manager', 'seller')
    `);

    if (!agents || agents.length === 0) {
      logger.warn('No agents available for lead distribution');
      return;
    }

    let agentIndex = 0;

    for (const lead of unassignedLeads as any[]) {
      const agent = agents[agentIndex % agents.length];
      
      await prisma.$queryRawUnsafe(`
        UPDATE public.leads 
        SET owner_id = $1, updated_at = NOW() 
        WHERE id = $2
      `, agent.user_id, lead.id);

      logger.info('Lead assigned', { leadId: lead.id, agentId: agent.user_id });
      agentIndex++;
    }

    return unassignedLeads.length;
  },

  async exportToCSV(filters: LeadFilter) {
    const leads = await this.getLeads(filters);
    
    // Convert to CSV format
    const headers = ['ID', 'Nome', 'Telefone', 'Email', 'Status', 'Origem', 'Score', 'Criado em'];
    const rows = leads.map((lead: any) => [
      lead.id,
      lead.name,
      lead.phone || '',
      lead.email || '',
      lead.status,
      lead.origin,
      lead.score,
      new Date(lead.created_at).toLocaleDateString('pt-BR')
    ]);

    return { headers, rows };
  }
};
