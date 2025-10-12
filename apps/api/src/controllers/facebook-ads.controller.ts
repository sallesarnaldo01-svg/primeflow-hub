import { Request, Response } from 'express';
import { facebookAdsService } from '../services/facebook-ads.service.js';
import { logger } from '../lib/logger.js';

export const facebookAdsController = {
  async getCampaigns(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as any;
      const { status } = req.query;
      const campaigns = await facebookAdsService.getCampaigns(tenantId, status as string);
      res.json(campaigns);
    } catch (error) {
      logger.error('Error getting Facebook campaigns', { error });
      res.status(500).json({ error: 'Failed to get campaigns' });
    }
  },

  async getCampaignById(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as any;
      const campaign = await facebookAdsService.getCampaignById(req.params.id, tenantId);
      if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
      res.json(campaign);
    } catch (error) {
      logger.error('Error getting Facebook campaign', { error });
      res.status(500).json({ error: 'Failed to get campaign' });
    }
  },

  async createCampaign(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as any;
      const campaign = await facebookAdsService.createCampaign({ ...req.body, tenantId });
      res.status(201).json(campaign);
    } catch (error) {
      logger.error('Error creating Facebook campaign', { error });
      res.status(500).json({ error: 'Failed to create campaign' });
    }
  },

  async updateCampaign(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as any;
      const campaign = await facebookAdsService.updateCampaign(req.params.id, tenantId, req.body);
      res.json(campaign);
    } catch (error) {
      logger.error('Error updating Facebook campaign', { error });
      res.status(500).json({ error: 'Failed to update campaign' });
    }
  },

  async deleteCampaign(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as any;
      await facebookAdsService.deleteCampaign(req.params.id, tenantId);
      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting Facebook campaign', { error });
      res.status(500).json({ error: 'Failed to delete campaign' });
    }
  },

  async pauseCampaign(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as any;
      const campaign = await facebookAdsService.pauseCampaign(req.params.id, tenantId);
      res.json(campaign);
    } catch (error) {
      logger.error('Error pausing campaign', { error });
      res.status(500).json({ error: 'Failed to pause campaign' });
    }
  },

  async activateCampaign(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as any;
      const campaign = await facebookAdsService.activateCampaign(req.params.id, tenantId);
      res.json(campaign);
    } catch (error) {
      logger.error('Error activating campaign', { error });
      res.status(500).json({ error: 'Failed to activate campaign' });
    }
  },

  async getCampaignMetrics(req: Request, res: Response) {
    try {
      const { dateFrom, dateTo } = req.query;
      const metrics = await facebookAdsService.getCampaignMetrics(
        req.params.id,
        dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo ? new Date(dateTo as string) : undefined
      );
      res.json(metrics);
    } catch (error) {
      logger.error('Error getting campaign metrics', { error });
      res.status(500).json({ error: 'Failed to get metrics' });
    }
  },

  async syncCampaignMetrics(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as any;
      const metrics = await facebookAdsService.syncCampaignMetrics(req.params.id, tenantId);
      res.json(metrics);
    } catch (error) {
      logger.error('Error syncing campaign metrics', { error });
      res.status(500).json({ error: 'Failed to sync metrics' });
    }
  },

  async syncLeads(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as any;
      const result = await facebookAdsService.syncLeadsFromFacebook(req.params.id, tenantId);
      res.json(result);
    } catch (error) {
      logger.error('Error syncing leads', { error });
      res.status(500).json({ error: 'Failed to sync leads' });
    }
  },

  async calculateROI(req: Request, res: Response) {
    try {
      const roi = await facebookAdsService.calculateROI(req.params.id);
      res.json(roi);
    } catch (error) {
      logger.error('Error calculating ROI', { error });
      res.status(500).json({ error: 'Failed to calculate ROI' });
    }
  }
};
