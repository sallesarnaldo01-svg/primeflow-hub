import { Router } from 'express';
import { aiUsageController } from '../controllers/ai-usage.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', aiUsageController.list);
router.get('/stats', aiUsageController.stats);
router.get('/lead/:leadId', aiUsageController.byLead);
router.post('/', aiUsageController.create);

export default router;
