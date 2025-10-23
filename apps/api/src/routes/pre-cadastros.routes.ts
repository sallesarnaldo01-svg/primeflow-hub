import { Router } from 'express';
import { preCadastrosController } from '../controllers/pre-cadastros.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// Pré-cadastros
router.get('/', preCadastrosController.getAll);
router.get('/:id', preCadastrosController.getById);
router.post('/', preCadastrosController.create);
router.put('/:id', preCadastrosController.update);
router.delete('/:id', preCadastrosController.delete);

// Documentos
router.post('/:id/documentos', preCadastrosController.uploadDocumento);
router.put('/:id/documentos/:documentoId/aprovar', preCadastrosController.aprovarDocumento);
router.put('/:id/documentos/:documentoId/rejeitar', preCadastrosController.rejeitarDocumento);

export default router;
