import { Router } from 'express';
import { connectionsController } from '../controllers/connections.controller.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

router.get('/', authenticate, asyncHandler(connectionsController.list));
router.get('/status', authenticate, asyncHandler(connectionsController.status));
router.get('/:id', authenticate, asyncHandler(connectionsController.get));
router.post('/', authenticate, asyncHandler(connectionsController.create));
router.put('/:id', authenticate, asyncHandler(connectionsController.update));
router.delete('/:id', authenticate, asyncHandler(connectionsController.delete));
router.post('/:id/connect', authenticate, asyncHandler(connectionsController.connect));
router.post('/:id/disconnect', authenticate, asyncHandler(connectionsController.disconnect));

export default router;
