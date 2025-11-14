import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

export const syncController = {
  async syncChannelContacts(req: Request, res: Response) {
    try {
      const { channel, connectionId } = req.body;
      const tenantId = req.user!.tenantId;

      if (!channel) {
        return res.status(400).json({ error: 'Channel is required' });
      }

      // Criar lista de contatos para o canal
      const result = await prisma.$queryRaw`
        SELECT create_channel_contact_list(
          ${tenantId}::uuid,
          ${channel.toUpperCase()}::text,
          ${connectionId || null}::uuid
        ) as list_id
      `;

      const listId = (result as any)[0]?.list_id;

      // Buscar todos os contatos do canal
      const contacts = await prisma.contact.findMany({
        where: {
          tenantId,
          channel: channel.toUpperCase()
        }
      });

      // Adicionar contatos à lista
      let addedCount = 0;
      for (const contact of contacts) {
        try {
          await prisma.contactListMember.create({
            data: {
              listId,
              contactId: contact.id,
              addedMethod: 'AUTO_SEGMENT',
              memberName: contact.name,
              memberPhone: contact.phone,
              memberEmail: contact.email
            }
          });
          addedCount++;
        } catch (error) {
          // Ignora duplicatas
        }
      }

      // Atualizar timestamp de sincronização
      await prisma.channelContactList.updateMany({
        where: {
          tenantId,
          channel: channel.toUpperCase(),
          connectionId: connectionId || null
        },
        data: {
          lastSyncAt: new Date()
        }
      });

      logger.info('Channel contacts synced', { 
        channel, 
        listId, 
        contactsCount: contacts.length,
        addedCount 
      });

      res.json({
        success: true,
        listId,
        synced: contacts.length,
        added: addedCount
      });
    } catch (error) {
      logger.error('Failed to sync channel contacts', { error });
      res.status(500).json({ error: 'Failed to sync contacts' });
    }
  },

  async getChannelLists(req: Request, res: Response) {
    try {
      const tenantId = req.user!.tenantId;

      const channelLists = await prisma.channelContactList.findMany({
        where: { tenantId },
        include: {
          list: {
            include: {
              _count: {
                select: { members: true }
              }
            }
          }
        }
      });

      res.json(channelLists);
    } catch (error) {
      logger.error('Failed to get channel lists', { error });
      res.status(500).json({ error: 'Failed to get channel lists' });
    }
  },

  async syncAllChannels(req: Request, res: Response) {
    try {
      const tenantId = req.user!.tenantId;

      const channels = ['WHATSAPP', 'FACEBOOK', 'INSTAGRAM'];
      const results = [];

      for (const channel of channels) {
        try {
          // Criar lista se não existir
          const result = await prisma.$queryRaw`
            SELECT create_channel_contact_list(
              ${tenantId}::uuid,
              ${channel}::text,
              NULL::uuid
            ) as list_id
          `;

          const listId = (result as any)[0]?.list_id;

          // Buscar contatos do canal
          const contacts = await prisma.contact.findMany({
            where: {
              tenantId,
              channel
            }
          });

          // Adicionar à lista
          let addedCount = 0;
          for (const contact of contacts) {
            try {
              await prisma.contactListMember.create({
                data: {
                  listId,
                  contactId: contact.id,
                  addedMethod: 'AUTO_SEGMENT',
                  memberName: contact.name,
                  memberPhone: contact.phone,
                  memberEmail: contact.email
                }
              });
              addedCount++;
            } catch (error) {
              // Ignora duplicatas
            }
          }

          results.push({
            channel,
            listId,
            synced: contacts.length,
            added: addedCount
          });
        } catch (error) {
          logger.error(`Failed to sync ${channel}`, { error });
        }
      }

      logger.info('All channels synced', { results });

      res.json({
        success: true,
        results
      });
    } catch (error) {
      logger.error('Failed to sync all channels', { error });
      res.status(500).json({ error: 'Failed to sync all channels' });
    }
  }
};
