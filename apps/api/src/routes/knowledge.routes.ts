import { Router } from 'express';
import { knowledgeController } from '../controllers/knowledge.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', knowledgeController.list);
router.post('/', knowledgeController.create);
router.delete('/:id', knowledgeController.delete);
router.post('/search', knowledgeController.search);

export default router;
