import { Router } from 'express';
import { messageTemplatesController } from '../controllers/message-templates.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', messageTemplatesController.list);
router.post('/', messageTemplatesController.create);
router.get('/:id', messageTemplatesController.get);
router.put('/:id', messageTemplatesController.update);
router.delete('/:id', messageTemplatesController.delete);

export default router;
