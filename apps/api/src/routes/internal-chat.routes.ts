import { Router } from 'express';
import { internalChatController } from '../controllers/internal-chat.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// Chats
router.get('/', internalChatController.listChats);
router.post('/', internalChatController.createChat);
router.get('/:id', internalChatController.getChat);
router.put('/:id', internalChatController.updateChat);
router.delete('/:id', internalChatController.deleteChat);

// Messages
router.get('/:chatId/messages', internalChatController.listMessages);
router.post('/:chatId/messages', internalChatController.sendMessage);
router.put('/:chatId/messages/:messageId/read', internalChatController.markAsRead);
router.delete('/:chatId/messages/:messageId', internalChatController.deleteMessage);

export default router;
