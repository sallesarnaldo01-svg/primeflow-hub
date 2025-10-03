import { Router } from 'express';
import { facebookController } from '../controllers/facebook.controller.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

router.post('/initiate', authenticate, asyncHandler(facebookController.initiateConnection));
router.get('/:connectionId/pages', authenticate, asyncHandler(facebookController.getPages));
router.get('/:connectionId/status', authenticate, asyncHandler(facebookController.getStatus));
router.post('/:connectionId/bulk', authenticate, asyncHandler(facebookController.sendBulkMessages));
router.post('/:connectionId/disconnect', authenticate, asyncHandler(facebookController.disconnect));

export default router;
