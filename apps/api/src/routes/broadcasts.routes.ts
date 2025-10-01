import { Router } from 'express';
import { broadcastsController } from '../controllers/broadcasts.controller.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

router.get('/', authenticate, asyncHandler(broadcastsController.list));
router.get('/:id', authenticate, asyncHandler(broadcastsController.get));
router.get('/:id/progress', authenticate, asyncHandler(broadcastsController.progress));
router.post('/', authenticate, asyncHandler(broadcastsController.create));
router.put('/:id', authenticate, asyncHandler(broadcastsController.update));
router.delete('/:id', authenticate, asyncHandler(broadcastsController.delete));
router.post('/:id/start', authenticate, asyncHandler(broadcastsController.start));
router.post('/:id/pause', authenticate, asyncHandler(broadcastsController.pause));

export default router;
