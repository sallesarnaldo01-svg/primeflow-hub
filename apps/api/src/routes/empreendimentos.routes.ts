import { Router } from 'express';
import { empreendimentosController } from '../controllers/empreendimentos.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', empreendimentosController.getAll);
router.get('/:id', empreendimentosController.getById);
router.post('/', empreendimentosController.create);
router.put('/:id', empreendimentosController.update);
router.delete('/:id', empreendimentosController.delete);

export default router;
