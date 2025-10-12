import { Request, Response } from 'express';
import { contactListsService } from '../services/contact-lists.service.js';
import { logger } from '../lib/logger.js';

export const contactListsController = {
  async getContactLists(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as any;
      const lists = await contactListsService.getContactLists(tenantId);
      res.json(lists);
    } catch (error) {
      logger.error('Error getting contact lists', { error });
      res.status(500).json({ error: 'Failed to get contact lists' });
    }
  },

  async getContactListById(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as any;
      const list = await contactListsService.getContactListById(req.params.id, tenantId);
      if (!list) return res.status(404).json({ error: 'List not found' });
      res.json(list);
    } catch (error) {
      logger.error('Error getting contact list', { error });
      res.status(500).json({ error: 'Failed to get contact list' });
    }
  },

  async createContactList(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as any;
      const list = await contactListsService.createContactList({ ...req.body, tenantId });
      res.status(201).json(list);
    } catch (error) {
      logger.error('Error creating contact list', { error });
      res.status(500).json({ error: 'Failed to create contact list' });
    }
  },

  async updateContactList(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as any;
      const list = await contactListsService.updateContactList(req.params.id, tenantId, req.body);
      res.json(list);
    } catch (error) {
      logger.error('Error updating contact list', { error });
      res.status(500).json({ error: 'Failed to update contact list' });
    }
  },

  async deleteContactList(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as any;
      await contactListsService.deleteContactList(req.params.id, tenantId);
      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting contact list', { error });
      res.status(500).json({ error: 'Failed to delete contact list' });
    }
  },

  async getListMembers(req: Request, res: Response) {
    try {
      const { limit = 100, offset = 0 } = req.query;
      const members = await contactListsService.getListMembers(
        req.params.id,
        Number(limit),
        Number(offset)
      );
      res.json(members);
    } catch (error) {
      logger.error('Error getting list members', { error });
      res.status(500).json({ error: 'Failed to get list members' });
    }
  },

  async addMemberToList(req: Request, res: Response) {
    try {
      const { userId } = req.user as any;
      const member = await contactListsService.addMemberToList({
        listId: req.params.id,
        ...req.body,
        addedBy: userId
      });
      res.status(201).json(member);
    } catch (error) {
      logger.error('Error adding member to list', { error });
      res.status(500).json({ error: 'Failed to add member to list' });
    }
  },

  async removeMemberFromList(req: Request, res: Response) {
    try {
      await contactListsService.removeMemberFromList(req.params.id, req.params.memberId);
      res.status(204).send();
    } catch (error) {
      logger.error('Error removing member from list', { error });
      res.status(500).json({ error: 'Failed to remove member from list' });
    }
  },

  async exportCSV(req: Request, res: Response) {
    try {
      const { headers, rows } = await contactListsService.exportToCSV(req.params.id);
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=list-${req.params.id}.csv`);
      res.send(csv);
    } catch (error) {
      logger.error('Error exporting CSV', { error });
      res.status(500).json({ error: 'Failed to export CSV' });
    }
  },

  async duplicateList(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as any;
      const { name } = req.body;
      const list = await contactListsService.duplicateList(req.params.id, tenantId, name);
      res.status(201).json(list);
    } catch (error) {
      logger.error('Error duplicating list', { error });
      res.status(500).json({ error: 'Failed to duplicate list' });
    }
  }
};
