import { Job } from 'bullmq';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

interface WorkflowExecutionJob {
  workflowId: string;
  tenantId: string;
  triggerData?: any;
  contextData?: any;
}

export async function processWorkflowExecution(job: Job<WorkflowExecutionJob>) {
  const { workflowId, tenantId, triggerData, contextData } = job.data;

  try {
    logger.info('Processing workflow execution', { workflowId });

    // Get workflow
    const workflow = await prisma.$queryRawUnsafe(`
      SELECT * FROM public.workflows 
      WHERE id = $1 AND tenant_id = $2
    `, workflowId, tenantId);

    if (!workflow || workflow.length === 0) {
      throw new Error('Workflow not found');
    }

    const workflowData = workflow[0];

    if (workflowData.status !== 'PUBLISHED') {
      throw new Error('Workflow is not published');
    }

    // Create workflow run
    const run = await prisma.$queryRawUnsafe(`
      INSERT INTO public.workflow_runs 
        (workflow_id, tenant_id, status, trigger_data, context_data, started_at)
      VALUES ($1, $2, 'RUNNING', $3, $4, NOW())
      RETURNING *
    `,
      workflowId,
      tenantId,
      JSON.stringify(triggerData || {}),
      JSON.stringify(contextData || {})
    );

    const runId = run[0].id;

    try {
      // Execute workflow
      const graphJson = workflowData.graph_json;
      const nodes = graphJson.nodes || [];
      const edges = graphJson.edges || [];

      // Find trigger node
      const triggerNode = nodes.find((n: any) => n.type === 'TRIGGER');
      if (!triggerNode) {
        throw new Error('No trigger node found');
      }

      // Execute nodes sequentially (simplified)
      const executionContext = { ...contextData };
      let currentNodeId = triggerNode.id;
      const executedNodes = new Set<string>();

      while (currentNodeId && !executedNodes.has(currentNodeId)) {
        const node = nodes.find((n: any) => n.id === currentNodeId);
        if (!node) break;

        executedNodes.add(currentNodeId);

        const startTime = Date.now();
        let nodeResult: any;
        let nodeStatus: 'SUCCESS' | 'ERROR' | 'SKIPPED' = 'SUCCESS';
        let errorMessage: string | undefined;

        try {
          nodeResult = await executeNode(node, executionContext, tenantId);
          
          // Update context with node result
          if (nodeResult) {
            executionContext[node.id] = nodeResult;
          }
        } catch (error) {
          nodeStatus = 'ERROR';
          errorMessage = error.message;
          logger.error('Node execution error', { nodeId: node.id, error });
        }

        const duration = Date.now() - startTime;

        // Log node execution
        await prisma.$queryRawUnsafe(`
          INSERT INTO public.workflow_logs 
            (run_id, node_id, node_type, status, input_data, output_data, error_message, duration_ms)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
          runId,
          node.id,
          node.type,
          nodeStatus,
          JSON.stringify(node.data || {}),
          JSON.stringify(nodeResult || {}),
          errorMessage,
          duration
        );

        if (nodeStatus === 'ERROR') {
          throw new Error(`Node ${node.id} failed: ${errorMessage}`);
        }

        // Find next node
        const nextEdge = edges.find((e: any) => e.source === currentNodeId);
        currentNodeId = nextEdge?.target;
      }

      // Mark run as completed
      await prisma.$queryRawUnsafe(`
        UPDATE public.workflow_runs 
        SET status = 'COMPLETED', completed_at = NOW(), result = $1
        WHERE id = $2
      `, JSON.stringify(executionContext), runId);

      logger.info('Workflow execution completed', { workflowId, runId });

      return { runId, status: 'COMPLETED' };
    } catch (error) {
      // Mark run as failed
      await prisma.$queryRawUnsafe(`
        UPDATE public.workflow_runs 
        SET status = 'FAILED', completed_at = NOW(), error = $1
        WHERE id = $2
      `, error.message, runId);

      throw error;
    }
  } catch (error) {
    logger.error('Error processing workflow execution', { workflowId, error });
    throw error;
  }
}

async function executeNode(node: any, context: any, tenantId: string): Promise<any> {
  const { type, data } = node;

  switch (type) {
    case 'TRIGGER':
      return { triggered: true };

    case 'ACTION':
      // Execute action based on configuration
      if (data.actionType === 'SEND_MESSAGE') {
        logger.info('Sending message', { leadId: context.leadId });
        // Implementation would send actual message
        return { sent: true };
      }
      if (data.actionType === 'CREATE_LEAD') {
        logger.info('Creating lead', { data: data.leadData });
        // Implementation would create actual lead
        return { created: true };
      }
      return { executed: true };

    case 'CONDITION':
      // Evaluate condition
      const condition = data.condition;
      const value = context[condition.field];
      
      switch (condition.operator) {
        case 'equals':
          return { result: value === condition.value };
        case 'contains':
          return { result: value && value.includes(condition.value) };
        case 'greater_than':
          return { result: value > condition.value };
        default:
          return { result: true };
      }

    case 'DELAY':
      // In production, this would schedule a delayed execution
      const delayMs = data.delayMs || 1000;
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return { delayed: delayMs };

    case 'HTTP':
      // Make HTTP request
      logger.info('Making HTTP request', { url: data.url });
      // Implementation would make actual HTTP request
      return { response: {} };

    default:
      logger.warn('Unknown node type', { type });
      return { executed: true };
  }
}
