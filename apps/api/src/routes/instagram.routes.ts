import { Router } from 'express';
import { instagramController } from '../controllers/instagram.controller.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

router.post('/initiate', authenticate, asyncHandler(instagramController.initiateConnection));
router.get('/:connectionId/accounts', authenticate, asyncHandler(instagramController.getAccounts));
router.get('/:connectionId/status', authenticate, asyncHandler(instagramController.getStatus));
router.post('/:connectionId/bulk', authenticate, asyncHandler(instagramController.sendBulkMessages));
router.post('/:connectionId/disconnect', authenticate, asyncHandler(instagramController.disconnect));

export default router;
