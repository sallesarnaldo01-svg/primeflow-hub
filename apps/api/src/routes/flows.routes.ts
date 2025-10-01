import { Router } from 'express';
import { flowsController } from '../controllers/flows.controller.js';
import { nodesController, edgesController } from '../controllers/nodes.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate, validateParams } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/error.js';
import {
  createFlowSchema,
  updateFlowSchema,
  createNodeSchema,
  createEdgeSchema
} from '@primeflow/shared/validators';
import { idParamSchema } from '@primeflow/shared/validators';

const router = Router();

// Flows
router.get('/', authenticate, asyncHandler(flowsController.list));
router.get('/:id', authenticate, validateParams(idParamSchema), asyncHandler(flowsController.get));
router.post('/', authenticate, validate(createFlowSchema), asyncHandler(flowsController.create));
router.put('/:id', authenticate, validateParams(idParamSchema), validate(updateFlowSchema), asyncHandler(flowsController.update));
router.delete('/:id', authenticate, validateParams(idParamSchema), asyncHandler(flowsController.delete));
router.post('/:id/publish', authenticate, validateParams(idParamSchema), asyncHandler(flowsController.publish));
router.post('/:id/duplicate', authenticate, validateParams(idParamSchema), asyncHandler(flowsController.duplicate));
router.post('/validate', authenticate, asyncHandler(flowsController.validate));

// Nodes
router.post('/:flowId/nodes', authenticate, validate(createNodeSchema), asyncHandler(nodesController.create));
router.put('/:flowId/nodes/:id', authenticate, asyncHandler(nodesController.update));
router.delete('/:flowId/nodes/:id', authenticate, asyncHandler(nodesController.delete));

// Edges
router.post('/:flowId/edges', authenticate, validate(createEdgeSchema), asyncHandler(edgesController.create));
router.put('/:flowId/edges/:id', authenticate, asyncHandler(edgesController.update));
router.delete('/:flowId/edges/:id', authenticate, asyncHandler(edgesController.delete));

export default router;
