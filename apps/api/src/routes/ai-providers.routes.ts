import { Router } from 'express';
import { aiProvidersController } from '../controllers/ai-providers.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Provedores
router.get('/providers', aiProvidersController.list);
router.post('/providers', aiProvidersController.create);
router.put('/providers/:id', aiProvidersController.update);
router.delete('/providers/:id', aiProvidersController.delete);

// Agentes
router.get('/agents', aiProvidersController.listAgents);
router.post('/agents', aiProvidersController.createAgent);
router.put('/agents/:id', aiProvidersController.updateAgent);
router.delete('/agents/:id', aiProvidersController.deleteAgent);

// Teste
router.post('/test', aiProvidersController.test);

export default router;
