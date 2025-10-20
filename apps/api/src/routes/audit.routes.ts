import { Router } from 'express';
import { auditController } from '../controllers/audit.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', auditController.list);
router.post('/', auditController.create);
router.get('/export', auditController.export);

export default router;
