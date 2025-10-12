import { Router } from 'express';
import { contactsController } from '../controllers/contacts.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', contactsController.list);
router.get('/:id', contactsController.getById);
router.post('/', contactsController.create);
router.patch('/:id', contactsController.update);
router.delete('/:id', contactsController.delete);
router.post('/:id/tags', contactsController.addTags);
router.delete('/:id/tags', contactsController.removeTags);
router.get('/:id/timeline', contactsController.getTimeline);

export default router;
