import { Router } from 'express';
import { aiAgentsController } from '../controllers/ai-agents.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/:id/config', aiAgentsController.getAgentConfig);
router.put('/:id/config', aiAgentsController.updateAgentConfig);
router.post('/:id/test', aiAgentsController.testAgent);

export default router;
