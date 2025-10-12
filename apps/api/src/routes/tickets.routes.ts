import { Router } from 'express';
import { ticketsController } from '../controllers/tickets.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', ticketsController.list);
router.get('/:id', ticketsController.getById);
router.post('/', ticketsController.create);
router.patch('/:id', ticketsController.update);
router.delete('/:id', ticketsController.delete);
router.post('/:id/comments', ticketsController.addComment);
router.get('/:id/comments', ticketsController.getComments);

export default router;
