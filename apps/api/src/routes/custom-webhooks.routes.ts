import { Router } from 'express';
import { customWebhooksController } from '../controllers/custom-webhooks.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// CRUD
router.get('/', authenticate, customWebhooksController.list);
router.get('/:id', authenticate, customWebhooksController.getById);
router.post('/', authenticate, customWebhooksController.create);
router.put('/:id', authenticate, customWebhooksController.update);
router.delete('/:id', authenticate, customWebhooksController.delete);

// Logs and stats
router.get('/:id/logs', authenticate, customWebhooksController.getLogs);
router.get('/:id/stats', authenticate, customWebhooksController.getStats);

// Actions
router.post('/:id/test', authenticate, customWebhooksController.test);
router.post('/:id/regenerate-secret', authenticate, customWebhooksController.regenerateSecret);

export default router;