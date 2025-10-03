import { Router } from 'express';
import { conversationEventsController } from '../controllers/conversation-events.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/:conversationId/events', conversationEventsController.list);
router.get('/:conversationId/timeline', conversationEventsController.timeline);
router.post('/:conversationId/events', conversationEventsController.create);
router.post('/:conversationId/events/:eventId/rate', conversationEventsController.rate);

export default router;
