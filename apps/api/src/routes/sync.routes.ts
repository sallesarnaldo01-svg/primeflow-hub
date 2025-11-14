import { Router } from 'express';
import { syncController } from '../controllers/sync.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/contacts', syncController.syncChannelContacts);
router.get('/channel-lists', syncController.getChannelLists);
router.post('/all', syncController.syncAllChannels);

export default router;
