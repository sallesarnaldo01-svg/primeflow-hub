import { Router } from 'express';
import { webhooksController } from '../controllers/webhooks.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// WhatsApp webhook (pode precisar de verificação de assinatura no futuro)
router.post('/whatsapp', authenticate, webhooksController.whatsappWebhook);

// Facebook webhook
router.post('/facebook', authenticate, webhooksController.facebookWebhook);

// Instagram webhook
router.post('/instagram', authenticate, webhooksController.instagramWebhook);

export default router;
