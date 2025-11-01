import { Router } from 'express';
import { correspondentesController } from '../controllers/correspondentes.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', correspondentesController.getAll);
router.get('/:id', correspondentesController.getById);
router.post('/', correspondentesController.create);
router.put('/:id', correspondentesController.update);
router.delete('/:id', correspondentesController.delete);

// Gerenciar usuários do correspondente
router.post('/:id/usuarios', correspondentesController.createUsuario);
router.put('/:id/usuarios/:usuarioId', correspondentesController.updateUsuario);
router.delete('/:id/usuarios/:usuarioId', correspondentesController.deleteUsuario);

export default router;
