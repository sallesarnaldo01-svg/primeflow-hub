import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as aiSettingsController from '../controllers/ai-settings.controller.js';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// GET /api/ai-agents - List all agents
router.get('/', aiSettingsController.listAgents);

// GET /api/ai-agents/:id - Get specific agent
router.get('/:id', aiSettingsController.getAgent);

// PUT /api/ai-agents/:id/system-prompt - Update system prompt
router.put('/:id/system-prompt', aiSettingsController.updateSystemPrompt);

// PUT /api/ai-agents/:id - Update agent
router.put('/:id', aiSettingsController.updateAgent);

export default router;
