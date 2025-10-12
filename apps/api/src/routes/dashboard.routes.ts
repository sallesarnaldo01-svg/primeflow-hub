import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/metrics', dashboardController.getMetrics);
router.get('/activity', dashboardController.getActivityFeed);
router.get('/trends', dashboardController.getConversationTrends);

export default router;
