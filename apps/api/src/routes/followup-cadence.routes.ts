import { Router } from 'express';
import { followUpCadenceController } from '../controllers/followup-cadence.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', followUpCadenceController.list);
router.get('/:id', followUpCadenceController.getById);
router.post('/', followUpCadenceController.create);
router.put('/:id', followUpCadenceController.update);
router.delete('/:id', followUpCadenceController.delete);
router.post('/:id/trigger', followUpCadenceController.trigger);

export default router;
