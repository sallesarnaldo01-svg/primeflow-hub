import { Router } from 'express';
import { leadInteractionsController } from '../controllers/lead-interactions.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/leads/:leadId/interactions', leadInteractionsController.getByLead);
router.post('/leads/:leadId/interactions', leadInteractionsController.create);
router.put('/leads/:leadId/interactions/:id', leadInteractionsController.update);
router.delete('/leads/:leadId/interactions/:id', leadInteractionsController.delete);

export default router;
