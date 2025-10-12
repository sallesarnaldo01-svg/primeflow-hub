import { Router } from 'express';
import { facebookAdsController } from '../controllers/facebook-ads.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', facebookAdsController.getCampaigns);
router.get('/:id', facebookAdsController.getCampaignById);
router.post('/', facebookAdsController.createCampaign);
router.put('/:id', facebookAdsController.updateCampaign);
router.delete('/:id', facebookAdsController.deleteCampaign);
router.post('/:id/pause', facebookAdsController.pauseCampaign);
router.post('/:id/activate', facebookAdsController.activateCampaign);
router.get('/:id/metrics', facebookAdsController.getCampaignMetrics);
router.post('/:id/sync-metrics', facebookAdsController.syncCampaignMetrics);
router.post('/:id/sync-leads', facebookAdsController.syncLeads);
router.get('/:id/roi', facebookAdsController.calculateROI);

export default router;
