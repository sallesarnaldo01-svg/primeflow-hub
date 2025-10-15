import { Router } from 'express';
import { propertiesController } from '../controllers/properties.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', propertiesController.list);
router.get('/:id', propertiesController.getById);
router.post('/', propertiesController.create);
router.put('/:id', propertiesController.update);
router.delete('/:id', propertiesController.delete);
router.post('/:id/generate-description', propertiesController.generateDescription);

export default router;
