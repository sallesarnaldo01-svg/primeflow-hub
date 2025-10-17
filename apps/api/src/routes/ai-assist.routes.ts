import { Router } from 'express';
import { aiAssistController } from '../controllers/ai-assist.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/draft', aiAssistController.generateDraft);
router.post('/prompt', aiAssistController.applyPrompt);

export default router;
