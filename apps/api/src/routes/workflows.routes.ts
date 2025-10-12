import { Router } from 'express';
import { workflowsController } from '../controllers/workflows.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', workflowsController.getWorkflows);
router.post('/validate', workflowsController.validateWorkflow);
router.get('/:id', workflowsController.getWorkflowById);
router.post('/', workflowsController.createWorkflow);
router.put('/:id', workflowsController.updateWorkflow);
router.delete('/:id', workflowsController.deleteWorkflow);
router.post('/:id/publish', workflowsController.publishWorkflow);
router.post('/:id/pause', workflowsController.pauseWorkflow);
router.post('/:id/duplicate', workflowsController.duplicateWorkflow);
router.get('/:id/runs', workflowsController.getWorkflowRuns);
router.get('/runs/:runId', workflowsController.getWorkflowRunById);
router.get('/runs/:runId/logs', workflowsController.getWorkflowLogs);

export default router;
