import { Router } from 'express';
import { tasksController } from '../controllers/tasks.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', tasksController.list);
router.post('/', tasksController.create);
router.get('/:id', tasksController.get);
router.patch('/:id', tasksController.update);
router.delete('/:id', tasksController.delete);
router.patch('/:id/move', tasksController.move);

// Comments
router.get('/:taskId/comments', tasksController.listComments);
router.post('/:taskId/comments', tasksController.createComment);
router.patch('/:taskId/comments/:commentId', tasksController.updateComment);
router.delete('/:taskId/comments/:commentId', tasksController.deleteComment);

export default router;
