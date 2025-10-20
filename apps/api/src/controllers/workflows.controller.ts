import { Request, Response } from 'express';
import { workflowsService } from '../services/workflows.service.js';
import { logger } from '../lib/logger.js';
import { workflowsQueue } from '../queues/workflows.queue.js';

export const workflowsController = {
  async getWorkflows(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as any;
      const { status } = req.query;
      const workflows = await workflowsService.getWorkflows(tenantId, status as string);
      res.json(workflows);
    } catch (error) {
      logger.error('Error getting workflows', { error });
      res.status(500).json({ error: 'Failed to get workflows' });
    }
  },

  async getWorkflowById(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as any;
      const workflow = await workflowsService.getWorkflowById(req.params.id, tenantId);
      if (!workflow) return res.status(404).json({ error: 'Workflow not found' });
      res.json(workflow);
    } catch (error) {
      logger.error('Error getting workflow', { error });
      res.status(500).json({ error: 'Failed to get workflow' });
    }
  },

  async createWorkflow(req: Request, res: Response) {
    try {
      const { tenantId, userId } = req.user as any;
      const workflow = await workflowsService.createWorkflow({
        ...req.body,
        tenantId,
        createdBy: userId
      });
      res.status(201).json(workflow);
    } catch (error) {
      logger.error('Error creating workflow', { error });
      res.status(500).json({ error: 'Failed to create workflow' });
    }
  },

  async updateWorkflow(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as any;
      const workflow = await workflowsService.updateWorkflow(req.params.id, tenantId, req.body);
      res.json(workflow);
    } catch (error) {
      logger.error('Error updating workflow', { error });
      res.status(500).json({ error: 'Failed to update workflow' });
    }
  },

  async deleteWorkflow(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as any;
      await workflowsService.deleteWorkflow(req.params.id, tenantId);
      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting workflow', { error });
      res.status(500).json({ error: 'Failed to delete workflow' });
    }
  },

  async publishWorkflow(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as any;
      const workflow = await workflowsService.publishWorkflow(req.params.id, tenantId);
      res.json(workflow);
    } catch (error) {
      logger.error('Error publishing workflow', { error });
      res.status(400).json({ error: error.message });
    }
  },

  async pauseWorkflow(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as any;
      const workflow = await workflowsService.pauseWorkflow(req.params.id, tenantId);
      res.json(workflow);
    } catch (error) {
      logger.error('Error pausing workflow', { error });
      res.status(500).json({ error: 'Failed to pause workflow' });
    }
  },

  async duplicateWorkflow(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as any;
      const { name } = req.body;
      const workflow = await workflowsService.duplicateWorkflow(req.params.id, tenantId, name);
      res.status(201).json(workflow);
    } catch (error) {
      logger.error('Error duplicating workflow', { error });
      res.status(500).json({ error: 'Failed to duplicate workflow' });
    }
  },

  async validateWorkflow(req: Request, res: Response) {
    try {
      const { graphJson } = req.body;
      const validation = workflowsService.validateWorkflow(graphJson);
      res.json(validation);
    } catch (error) {
      logger.error('Error validating workflow', { error });
      res.status(500).json({ error: 'Failed to validate workflow' });
    }
  },

  async getWorkflowRuns(req: Request, res: Response) {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const runs = await workflowsService.getWorkflowRuns(
        req.params.id,
        Number(limit),
        Number(offset)
      );
      res.json(runs);
    } catch (error) {
      logger.error('Error getting workflow runs', { error });
      res.status(500).json({ error: 'Failed to get workflow runs' });
    }
  },

  async getWorkflowRunById(req: Request, res: Response) {
    try {
      const run = await workflowsService.getWorkflowRunById(req.params.runId);
      if (!run) return res.status(404).json({ error: 'Run not found' });
      res.json(run);
    } catch (error) {
      logger.error('Error getting workflow run', { error });
      res.status(500).json({ error: 'Failed to get workflow run' });
    }
  },

  async getWorkflowLogs(req: Request, res: Response) {
    try {
      const logs = await workflowsService.getWorkflowLogs(req.params.runId);
      res.json(logs);
    } catch (error) {
      logger.error('Error getting workflow logs', { error });
      res.status(500).json({ error: 'Failed to get workflow logs' });
    }
  },

  async executeWorkflow(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as any;
      const { id } = req.params;
      const { triggerData, contextData } = req.body;

      // Add job to queue
      const job = await workflowsQueue.add('execute', {
        workflowId: id,
        tenantId,
        triggerData,
        contextData
      });

      logger.info('Workflow execution queued', { workflowId: id, jobId: job.id });

      res.json({
        jobId: job.id,
        message: 'Workflow execution started'
      });
    } catch (error) {
      logger.error('Error executing workflow', { error });
      res.status(500).json({ error: 'Failed to execute workflow' });
    }
  }
};
