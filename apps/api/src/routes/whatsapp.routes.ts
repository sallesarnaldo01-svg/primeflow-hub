import { Router } from 'express';
import { whatsappController } from '../controllers/whatsapp.controller.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

router.post('/initiate', authenticate, asyncHandler(whatsappController.initiateConnection));
router.get('/:connectionId/qr', authenticate, asyncHandler(whatsappController.getQRCode));
router.get('/:connectionId/status', authenticate, asyncHandler(whatsappController.getConnectionStatus));
router.post('/:connectionId/bulk', authenticate, asyncHandler(whatsappController.sendBulkMessages));
router.post('/:connectionId/disconnect', authenticate, asyncHandler(whatsappController.disconnectWhatsApp));

export default router;
