import { Router } from 'express';
import { customFieldsController } from '../controllers/custom-fields.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', customFieldsController.list);
router.get('/entities', customFieldsController.listEntities);
router.post('/', customFieldsController.create);
router.put('/:id', customFieldsController.update);
router.delete('/:id', customFieldsController.delete);

export default router;
