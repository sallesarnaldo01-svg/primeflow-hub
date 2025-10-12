import { Router } from 'express';
import { leadsController } from '../controllers/leads.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', leadsController.getLeads);
router.get('/export', leadsController.exportCSV);
router.post('/distribute', leadsController.distributeLeads);
router.get('/:id', leadsController.getLeadById);
router.post('/', leadsController.createLead);
router.put('/:id', leadsController.updateLead);
router.delete('/:id', leadsController.deleteLead);
router.get('/:id/messages', leadsController.getLeadMessages);

export default router;
