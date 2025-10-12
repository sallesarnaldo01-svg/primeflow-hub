import { Router } from 'express';
import { conversationsController } from '../controllers/conversations.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', conversationsController.list);
router.get('/:conversationId/messages', conversationsController.getMessages);
router.post('/:conversationId/messages', conversationsController.sendMessage);
router.patch('/:conversationId/status', conversationsController.updateStatus);
router.patch('/:conversationId/assign', conversationsController.assign);
router.post('/:conversationId/read', conversationsController.markAsRead);

export default router;
