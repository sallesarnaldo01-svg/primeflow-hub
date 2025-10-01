import { Router } from 'express';
import { campaignsController } from '../controllers/campaigns.controller.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

router.get('/', authenticate, asyncHandler(campaignsController.list));
router.get('/:id', authenticate, asyncHandler(campaignsController.get));
router.post('/', authenticate, asyncHandler(campaignsController.create));
router.put('/:id', authenticate, asyncHandler(campaignsController.update));
router.delete('/:id', authenticate, asyncHandler(campaignsController.delete));
router.post('/:id/toggle', authenticate, asyncHandler(campaignsController.toggle));

export default router;
