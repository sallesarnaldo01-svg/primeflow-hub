import { Router } from 'express';
import { dealsController } from '../controllers/deals.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', dealsController.list);
router.get('/:id', dealsController.getById);
router.post('/', dealsController.create);
router.put('/:id', dealsController.update);
router.patch('/:id/stage', dealsController.updateStage);
router.delete('/:id', dealsController.delete);
router.post('/:id/qualify', dealsController.qualifyLead);
router.post('/:id/recommend-properties', dealsController.recommendProperties);
router.post('/bulk-ai-action', dealsController.bulkAIAction);

export default router;
