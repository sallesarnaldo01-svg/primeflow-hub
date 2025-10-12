import { Request, Response } from 'express';
import { leadsService } from '../services/leads.service.js';
import { logger } from '../lib/logger.js';

export const leadsController = {
  async getLeads(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as any;
      const filters = { ...req.query, tenantId };
      const leads = await leadsService.getLeads(filters as any);
      res.json(leads);
    } catch (error) {
      logger.error('Error getting leads', { error });
      res.status(500).json({ error: 'Failed to get leads' });
    }
  },

  async getLeadById(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as any;
      const lead = await leadsService.getLeadById(req.params.id, tenantId);
      if (!lead) return res.status(404).json({ error: 'Lead not found' });
      res.json(lead);
    } catch (error) {
      logger.error('Error getting lead', { error });
      res.status(500).json({ error: 'Failed to get lead' });
    }
  },

  async createLead(req: Request, res: Response) {
    try {
      const { tenantId, userId } = req.user as any;
      const lead = await leadsService.createLead({ ...req.body, tenantId, ownerId: userId });
      res.status(201).json(lead);
    } catch (error) {
      logger.error('Error creating lead', { error });
      res.status(500).json({ error: 'Failed to create lead' });
    }
  },

  async updateLead(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as any;
      const lead = await leadsService.updateLead(req.params.id, tenantId, req.body);
      res.json(lead);
    } catch (error) {
      logger.error('Error updating lead', { error });
      res.status(500).json({ error: 'Failed to update lead' });
    }
  },

  async deleteLead(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as any;
      await leadsService.deleteLead(req.params.id, tenantId);
      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting lead', { error });
      res.status(500).json({ error: 'Failed to delete lead' });
    }
  },

  async getLeadMessages(req: Request, res: Response) {
    try {
      const messages = await leadsService.getLeadMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      logger.error('Error getting messages', { error });
      res.status(500).json({ error: 'Failed to get messages' });
    }
  },

  async distributeLeads(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as any;
      const count = await leadsService.distributeLeads(tenantId, req.body.method);
      res.json({ distributed: count });
    } catch (error) {
      logger.error('Error distributing leads', { error });
      res.status(500).json({ error: 'Failed to distribute leads' });
    }
  },

  async exportCSV(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as any;
      const { headers, rows } = await leadsService.exportToCSV({ ...req.query, tenantId } as any);
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
      res.send(csv);
    } catch (error) {
      logger.error('Error exporting CSV', { error });
      res.status(500).json({ error: 'Failed to export CSV' });
    }
  }
};
