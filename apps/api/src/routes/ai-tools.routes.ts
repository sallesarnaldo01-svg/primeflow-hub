import { Router } from 'express';
import { aiToolsController } from '../controllers/ai-tools.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', aiToolsController.list);
router.post('/', aiToolsController.create);
router.put('/:id', aiToolsController.update);
router.delete('/:id', aiToolsController.delete);
router.post('/:id/test', aiToolsController.test);

export default router;
