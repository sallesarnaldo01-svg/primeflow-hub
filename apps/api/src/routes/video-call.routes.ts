import { Router } from 'express';
import { videoCallController } from '../controllers/video-call.controller.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

router.post('/create', authenticate, asyncHandler(videoCallController.createRoom));
router.post('/:id/end', authenticate, asyncHandler(videoCallController.endCall));
router.get('/', authenticate, asyncHandler(videoCallController.listCalls));

export default router;
