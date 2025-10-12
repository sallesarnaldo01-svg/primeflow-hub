import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

export interface CreateFacebookCampaignData {
  tenantId: string;
  name: string;
  objective: string;
  budgetDaily?: number;
  budgetTotal?: number;
  startDate?: Date;
  endDate?: Date;
  targetAudience?: any;
  targetLists?: string[];
  creativeConfig?: any;
}

export interface UpdateFacebookCampaignData {
  name?: string;
  status?: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  budgetDaily?: number;
  budgetTotal?: number;
  startDate?: Date;
  endDate?: Date;
  targetAudience?: any;
  creativeConfig?: any;
}

export const facebookAdsService = {
  async getCampaigns(tenantId: string, status?: string) {
    const query = status
      ? `SELECT * FROM public.facebook_campaigns WHERE tenant_id = $1 AND status = $2 ORDER BY created_at DESC`
      : `SELECT * FROM public.facebook_campaigns WHERE tenant_id = $1 ORDER BY created_at DESC`;
    
    const params = status ? [tenantId, status] : [tenantId];

    const campaigns = await prisma.$queryRawUnsafe(query, ...params);
    return campaigns;
  },

  async getCampaignById(id: string, tenantId: string) {
    const campaign = await prisma.$queryRawUnsafe(`
      SELECT * FROM public.facebook_campaigns 
      WHERE id = $1 AND tenant_id = $2
    `, id, tenantId);

    return campaign[0];
  },

  async createCampaign(data: CreateFacebookCampaignData) {
    logger.info('Creating Facebook campaign', { name: data.name });

    const campaign = await prisma.$queryRawUnsafe(`
      INSERT INTO public.facebook_campaigns 
        (tenant_id, name, status, objective, budget_daily, budget_total, start_date, end_date, 
         target_audience, target_lists, creative_config)
      VALUES ($1, $2, 'PAUSED', $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `,
      data.tenantId,
      data.name,
      data.objective,
      data.budgetDaily,
      data.budgetTotal,
      data.startDate,
      data.endDate,
      JSON.stringify(data.targetAudience || {}),
      data.targetLists || [],
      JSON.stringify(data.creativeConfig || {})
    );

    // In production, create campaign via Facebook Ads API
    // const fbCampaignId = await this.createFacebookCampaignViaAPI(campaign[0]);
    // await this.updateCampaignFbId(campaign[0].id, fbCampaignId);

    return campaign[0];
  },

  async updateCampaign(id: string, tenantId: string, data: UpdateFacebookCampaignData) {
    const updates = [];
    const values = [id, tenantId];
    let paramIndex = 3;

    if (data.name) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.status) {
      updates.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }
    if (data.budgetDaily !== undefined) {
      updates.push(`budget_daily = $${paramIndex++}`);
      values.push(data.budgetDaily);
    }
    if (data.budgetTotal !== undefined) {
      updates.push(`budget_total = $${paramIndex++}`);
      values.push(data.budgetTotal);
    }
    if (data.startDate) {
      updates.push(`start_date = $${paramIndex++}`);
      values.push(data.startDate);
    }
    if (data.endDate) {
      updates.push(`end_date = $${paramIndex++}`);
      values.push(data.endDate);
    }
    if (data.targetAudience) {
      updates.push(`target_audience = $${paramIndex++}`);
      values.push(JSON.stringify(data.targetAudience));
    }
    if (data.creativeConfig) {
      updates.push(`creative_config = $${paramIndex++}`);
      values.push(JSON.stringify(data.creativeConfig));
    }

    const campaign = await prisma.$queryRawUnsafe(`
      UPDATE public.facebook_campaigns 
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $1 AND tenant_id = $2
      RETURNING *
    `, ...values);

    // In production, update campaign via Facebook Ads API
    // if (campaign[0].fb_campaign_id) {
    //   await this.updateFacebookCampaignViaAPI(campaign[0].fb_campaign_id, data);
    // }

    return campaign[0];
  },

  async deleteCampaign(id: string, tenantId: string) {
    const campaign = await this.getCampaignById(id, tenantId);
    
    if (campaign?.fb_campaign_id) {
      // In production, delete from Facebook Ads API
      // await this.deleteFacebookCampaignViaAPI(campaign.fb_campaign_id);
    }

    await prisma.$queryRawUnsafe(`
      DELETE FROM public.facebook_campaigns 
      WHERE id = $1 AND tenant_id = $2
    `, id, tenantId);

    logger.info('Facebook campaign deleted', { campaignId: id });
  },

  async pauseCampaign(id: string, tenantId: string) {
    return this.updateCampaign(id, tenantId, { status: 'PAUSED' });
  },

  async activateCampaign(id: string, tenantId: string) {
    return this.updateCampaign(id, tenantId, { status: 'ACTIVE' });
  },

  async getCampaignMetrics(campaignId: string, dateFrom?: Date, dateTo?: Date) {
    let query = `
      SELECT * FROM public.facebook_campaign_metrics 
      WHERE campaign_id = $1
    `;
    const params: any[] = [campaignId];

    if (dateFrom && dateTo) {
      query += ` AND date BETWEEN $2 AND $3`;
      params.push(dateFrom, dateTo);
    }

    query += ` ORDER BY date DESC`;

    const metrics = await prisma.$queryRawUnsafe(query, ...params);
    return metrics;
  },

  async addCampaignMetrics(data: {
    campaignId: string;
    date: Date;
    impressions?: number;
    clicks?: number;
    conversions?: number;
    spend?: number;
    ctr?: number;
    cpc?: number;
    cpa?: number;
    metadata?: any;
  }) {
    const metrics = await prisma.$queryRawUnsafe(`
      INSERT INTO public.facebook_campaign_metrics 
        (campaign_id, date, impressions, clicks, conversions, spend, ctr, cpc, cpa, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (campaign_id, date) 
      DO UPDATE SET 
        impressions = EXCLUDED.impressions,
        clicks = EXCLUDED.clicks,
        conversions = EXCLUDED.conversions,
        spend = EXCLUDED.spend,
        ctr = EXCLUDED.ctr,
        cpc = EXCLUDED.cpc,
        cpa = EXCLUDED.cpa,
        metadata = EXCLUDED.metadata,
        created_at = NOW()
      RETURNING *
    `,
      data.campaignId,
      data.date,
      data.impressions || 0,
      data.clicks || 0,
      data.conversions || 0,
      data.spend || 0,
      data.ctr || 0,
      data.cpc || 0,
      data.cpa || 0,
      JSON.stringify(data.metadata || {})
    );

    return metrics[0];
  },

  async syncCampaignMetrics(campaignId: string, tenantId: string) {
    const campaign = await this.getCampaignById(campaignId, tenantId);
    
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    logger.info('Syncing campaign metrics', { campaignId });

    // In production, fetch metrics from Facebook Ads API
    // const fbMetrics = await this.fetchMetricsFromFacebookAPI(campaign.fb_campaign_id);
    
    // For now, create mock metrics
    const today = new Date();
    const mockMetrics = {
      campaignId,
      date: today,
      impressions: Math.floor(Math.random() * 10000),
      clicks: Math.floor(Math.random() * 500),
      conversions: Math.floor(Math.random() * 50),
      spend: Math.random() * 1000
    };

    // Calculate derived metrics
    mockMetrics.ctr = (mockMetrics.clicks / mockMetrics.impressions) * 100;
    mockMetrics.cpc = mockMetrics.spend / mockMetrics.clicks;
    mockMetrics.cpa = mockMetrics.spend / mockMetrics.conversions;

    await this.addCampaignMetrics(mockMetrics as any);

    // Update campaign last sync time
    await prisma.$queryRawUnsafe(`
      UPDATE public.facebook_campaigns 
      SET last_sync_at = NOW(), metrics = $1
      WHERE id = $2
    `, JSON.stringify(mockMetrics), campaignId);

    return mockMetrics;
  },

  async syncLeadsFromFacebook(campaignId: string, tenantId: string) {
    const campaign = await this.getCampaignById(campaignId, tenantId);
    
    if (!campaign?.fb_campaign_id) {
      throw new Error('Campaign not connected to Facebook');
    }

    logger.info('Syncing leads from Facebook', { campaignId });

    // In production, fetch leads from Facebook Lead Ads API
    // const fbLeads = await this.fetchLeadsFromFacebookAPI(campaign.fb_campaign_id);
    
    // For each lead, create in our CRM
    // fbLeads.forEach(async (fbLead) => {
    //   await prisma.$queryRawUnsafe(`
    //     INSERT INTO public.leads (tenant_id, name, phone, email, origin, status)
    //     VALUES ($1, $2, $3, $4, 'FACEBOOK_ADS', 'NEW')
    //     ON CONFLICT (phone) DO NOTHING
    //   `, tenantId, fbLead.name, fbLead.phone, fbLead.email);
    // });

    return { synced: 0 };
  },

  async calculateROI(campaignId: string) {
    const metrics = await this.getCampaignMetrics(campaignId);
    
    const totalSpend = metrics.reduce((sum: number, m: any) => sum + (parseFloat(m.spend) || 0), 0);
    const totalConversions = metrics.reduce((sum: number, m: any) => sum + (m.conversions || 0), 0);

    // Calculate estimated revenue (this would come from actual deal values)
    // For now, use a placeholder
    const estimatedRevenue = totalConversions * 500; // Assuming R$500 per conversion

    const roi = totalSpend > 0 ? ((estimatedRevenue - totalSpend) / totalSpend) * 100 : 0;

    return {
      totalSpend,
      totalConversions,
      estimatedRevenue,
      roi
    };
  }
};
