import { Router } from 'express';
import { productsController } from '../controllers/products.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', productsController.list);
router.get('/:id', productsController.getById);
router.post('/', productsController.create);
router.put('/:id', productsController.update);
router.delete('/:id', productsController.delete);
router.post('/:id/images', productsController.addImage);

export default router;
