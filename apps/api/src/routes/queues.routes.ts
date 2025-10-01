import { Router } from 'express';
import { queuesController } from '../controllers/queues.controller.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

router.get('/', authenticate, asyncHandler(queuesController.list));
router.get('/:id', authenticate, asyncHandler(queuesController.get));
router.post('/', authenticate, asyncHandler(queuesController.create));
router.put('/:id', authenticate, asyncHandler(queuesController.update));
router.delete('/:id', authenticate, asyncHandler(queuesController.delete));

export default router;
