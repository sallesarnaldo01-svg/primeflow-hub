import { Router } from 'express';
import { companySettingsController } from '../controllers/company-settings.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', companySettingsController.get);
router.patch('/', companySettingsController.update);

export default router;
