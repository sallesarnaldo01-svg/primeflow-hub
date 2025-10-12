import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

export interface CreateWorkflowData {
  tenantId: string;
  name: string;
  description?: string;
  graphJson: any;
  triggerConfig?: any;
  rateLimitConfig?: any;
  tags?: string[];
  createdBy?: string;
}

export interface UpdateWorkflowData {
  name?: string;
  description?: string;
  graphJson?: any;
  status?: 'DRAFT' | 'PUBLISHED' | 'PAUSED' | 'ARCHIVED';
  triggerConfig?: any;
  rateLimitConfig?: any;
  tags?: string[];
}

export const workflowsService = {
  async getWorkflows(tenantId: string, status?: string) {
    const query = status 
      ? `SELECT * FROM public.workflows WHERE tenant_id = $1 AND status = $2 ORDER BY created_at DESC`
      : `SELECT * FROM public.workflows WHERE tenant_id = $1 ORDER BY created_at DESC`;
    
    const params = status ? [tenantId, status] : [tenantId];

    const workflows = await prisma.$queryRawUnsafe(query, ...params);
    return workflows;
  },

  async getWorkflowById(id: string, tenantId: string) {
    const workflow = await prisma.$queryRawUnsafe(`
      SELECT * FROM public.workflows 
      WHERE id = $1 AND tenant_id = $2
    `, id, tenantId);

    return workflow[0];
  },

  async createWorkflow(data: CreateWorkflowData) {
    logger.info('Creating workflow', { name: data.name });

    const workflow = await prisma.$queryRawUnsafe(`
      INSERT INTO public.workflows 
        (tenant_id, name, description, graph_json, trigger_config, rate_limit_config, tags, created_by, status, version)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'DRAFT', 1)
      RETURNING *
    `,
      data.tenantId,
      data.name,
      data.description,
      JSON.stringify(data.graphJson),
      JSON.stringify(data.triggerConfig || {}),
      JSON.stringify(data.rateLimitConfig || {}),
      data.tags || [],
      data.createdBy
    );

    return workflow[0];
  },

  async updateWorkflow(id: string, tenantId: string, data: UpdateWorkflowData) {
    const updates = [];
    const values = [id, tenantId];
    let paramIndex = 3;

    if (data.name) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(data.description);
    }
    if (data.graphJson) {
      updates.push(`graph_json = $${paramIndex++}`);
      values.push(JSON.stringify(data.graphJson));
    }
    if (data.status) {
      updates.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }
    if (data.triggerConfig) {
      updates.push(`trigger_config = $${paramIndex++}`);
      values.push(JSON.stringify(data.triggerConfig));
    }
    if (data.rateLimitConfig) {
      updates.push(`rate_limit_config = $${paramIndex++}`);
      values.push(JSON.stringify(data.rateLimitConfig));
    }
    if (data.tags) {
      updates.push(`tags = $${paramIndex++}`);
      values.push(data.tags);
    }

    const workflow = await prisma.$queryRawUnsafe(`
      UPDATE public.workflows 
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $1 AND tenant_id = $2
      RETURNING *
    `, ...values);

    return workflow[0];
  },

  async deleteWorkflow(id: string, tenantId: string) {
    await prisma.$queryRawUnsafe(`
      DELETE FROM public.workflows 
      WHERE id = $1 AND tenant_id = $2
    `, id, tenantId);

    logger.info('Workflow deleted', { workflowId: id });
  },

  async publishWorkflow(id: string, tenantId: string) {
    // Validate workflow before publishing
    const workflow = await this.getWorkflowById(id, tenantId);
    
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    const validation = this.validateWorkflow(workflow.graph_json);
    
    if (!validation.valid) {
      throw new Error(`Workflow validation failed: ${validation.errors.join(', ')}`);
    }

    const updated = await prisma.$queryRawUnsafe(`
      UPDATE public.workflows 
      SET status = 'PUBLISHED', published_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND tenant_id = $2
      RETURNING *
    `, id, tenantId);

    logger.info('Workflow published', { workflowId: id });
    return updated[0];
  },

  async pauseWorkflow(id: string, tenantId: string) {
    const updated = await prisma.$queryRawUnsafe(`
      UPDATE public.workflows 
      SET status = 'PAUSED', updated_at = NOW()
      WHERE id = $1 AND tenant_id = $2
      RETURNING *
    `, id, tenantId);

    return updated[0];
  },

  async duplicateWorkflow(id: string, tenantId: string, newName: string) {
    const original = await this.getWorkflowById(id, tenantId);
    
    if (!original) {
      throw new Error('Workflow not found');
    }

    const duplicate = await this.createWorkflow({
      tenantId,
      name: newName,
      description: original.description,
      graphJson: original.graph_json,
      triggerConfig: original.trigger_config,
      rateLimitConfig: original.rate_limit_config,
      tags: original.tags
    });

    return duplicate;
  },

  validateWorkflow(graphJson: any) {
    const errors: string[] = [];
    
    // Check for nodes and edges
    if (!graphJson.nodes || graphJson.nodes.length === 0) {
      errors.push('Workflow must have at least one node');
    }

    // Check for trigger node
    const hasTrigger = graphJson.nodes?.some((n: any) => n.type === 'TRIGGER');
    if (!hasTrigger) {
      errors.push('Workflow must have a trigger node');
    }

    // Check for disconnected nodes
    const nodeIds = new Set(graphJson.nodes?.map((n: any) => n.id) || []);
    const connectedNodes = new Set();
    
    graphJson.edges?.forEach((e: any) => {
      connectedNodes.add(e.source);
      connectedNodes.add(e.target);
    });

    const disconnected = [...nodeIds].filter(id => !connectedNodes.has(id));
    if (disconnected.length > 1) { // Allow trigger to be "disconnected"
      errors.push(`Disconnected nodes: ${disconnected.join(', ')}`);
    }

    // Check for infinite loops (simplified)
    // In production, implement proper cycle detection

    return {
      valid: errors.length === 0,
      errors
    };
  },

  async getWorkflowRuns(workflowId: string, limit: number = 50, offset: number = 0) {
    const runs = await prisma.$queryRawUnsafe(`
      SELECT * FROM public.workflow_runs 
      WHERE workflow_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `, workflowId, limit, offset);

    return runs;
  },

  async getWorkflowRunById(runId: string) {
    const run = await prisma.$queryRawUnsafe(`
      SELECT * FROM public.workflow_runs 
      WHERE id = $1
    `, runId);

    return run[0];
  },

  async getWorkflowLogs(runId: string) {
    const logs = await prisma.$queryRawUnsafe(`
      SELECT * FROM public.workflow_logs 
      WHERE run_id = $1 
      ORDER BY executed_at ASC
    `, runId);

    return logs;
  },

  async createWorkflowRun(data: {
    workflowId: string;
    tenantId: string;
    triggerData?: any;
    contextData?: any;
  }) {
    const run = await prisma.$queryRawUnsafe(`
      INSERT INTO public.workflow_runs 
        (workflow_id, tenant_id, status, trigger_data, context_data, started_at)
      VALUES ($1, $2, 'RUNNING', $3, $4, NOW())
      RETURNING *
    `,
      data.workflowId,
      data.tenantId,
      JSON.stringify(data.triggerData || {}),
      JSON.stringify(data.contextData || {})
    );

    return run[0];
  },

  async updateWorkflowRun(runId: string, data: {
    status?: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
    result?: any;
    error?: string;
  }) {
    const updates = [];
    const values = [runId];
    let paramIndex = 2;

    if (data.status) {
      updates.push(`status = $${paramIndex++}`);
      values.push(data.status);
      
      if (data.status === 'COMPLETED' || data.status === 'FAILED') {
        updates.push(`completed_at = NOW()`);
      }
    }
    if (data.result) {
      updates.push(`result = $${paramIndex++}`);
      values.push(JSON.stringify(data.result));
    }
    if (data.error) {
      updates.push(`error = $${paramIndex++}`);
      values.push(data.error);
    }

    const run = await prisma.$queryRawUnsafe(`
      UPDATE public.workflow_runs 
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING *
    `, ...values);

    return run[0];
  },

  async addWorkflowLog(data: {
    runId: string;
    nodeId: string;
    nodeType: string;
    status: 'SUCCESS' | 'ERROR' | 'SKIPPED';
    inputData?: any;
    outputData?: any;
    errorMessage?: string;
    tokensUsed?: number;
    costBrl?: number;
    durationMs?: number;
  }) {
    const log = await prisma.$queryRawUnsafe(`
      INSERT INTO public.workflow_logs 
        (run_id, node_id, node_type, status, input_data, output_data, error_message, tokens_used, cost_brl, duration_ms)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `,
      data.runId,
      data.nodeId,
      data.nodeType,
      data.status,
      JSON.stringify(data.inputData || {}),
      JSON.stringify(data.outputData || {}),
      data.errorMessage,
      data.tokensUsed,
      data.costBrl,
      data.durationMs
    );

    return log[0];
  }
};
