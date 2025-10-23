import { Router } from 'express';
import { simulacoesController } from '../controllers/simulacoes.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/calcular', simulacoesController.calcular);
router.post('/', simulacoesController.salvar);
router.get('/', simulacoesController.getAll);
router.get('/:id', simulacoesController.getById);
router.delete('/:id', simulacoesController.delete);

export default router;
