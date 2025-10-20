import { Job } from 'bullmq';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { AIObjectiveExecutor } from '../executors/ai-objective.executor.js';

interface WorkflowExecutionJob {
  workflowId: string;
  tenantId: string;
  triggerData?: any;
  contextData?: any;
}

const aiObjectiveExecutor = new AIObjectiveExecutor();

export async function processWorkflowExecution(job: Job<WorkflowExecutionJob>) {
  const { workflowId, tenantId, triggerData, contextData } = job.data;

  try {
    logger.info('Processing workflow execution', { workflowId, jobId: job.id });

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

      // Execute nodes sequentially
      const executionContext = { ...contextData, ...triggerData };
      let currentNodeId = triggerNode.id;
      const executedNodes = new Set<string>();
      const maxIterations = 100; // Prevent infinite loops
      let iteration = 0;

      while (currentNodeId && !executedNodes.has(currentNodeId) && iteration < maxIterations) {
        const node = nodes.find((n: any) => n.id === currentNodeId);
        if (!node) break;

        executedNodes.add(currentNodeId);
        iteration++;

        const startTime = Date.now();
        let nodeResult: any;
        let nodeStatus: 'SUCCESS' | 'ERROR' | 'SKIPPED' = 'SUCCESS';
        let errorMessage: string | undefined;
        let tokensUsed = 0;
        let costBrl = 0;

        try {
          const result = await executeNode(node, executionContext, tenantId);
          nodeResult = result.data;
          tokensUsed = result.tokensUsed || 0;
          costBrl = result.costBrl || 0;

          // Update context with node result
          if (nodeResult) {
            Object.assign(executionContext, nodeResult);
          }

          // Handle branching for AI Objectives
          if (node.type === 'AI_OBJECTIVE' && nodeResult.status) {
            currentNodeId = findNextNodeByBranch(edges, currentNodeId, nodeResult.status);
            continue;
          }
        } catch (error: any) {
          nodeStatus = 'ERROR';
          errorMessage = error.message;
          logger.error('Node execution error', { nodeId: node.id, error });
        }

        const duration = Date.now() - startTime;

        // Log node execution
        await prisma.$queryRawUnsafe(`
          INSERT INTO public.workflow_logs 
            (run_id, node_id, node_type, status, input_data, output_data, error_message, duration_ms, tokens_used, cost_brl)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `,
          runId,
          node.id,
          node.type,
          nodeStatus,
          JSON.stringify(node.data || {}),
          JSON.stringify(nodeResult || {}),
          errorMessage,
          duration,
          tokensUsed,
          costBrl
        );

        if (nodeStatus === 'ERROR') {
          throw new Error(`Node ${node.id} failed: ${errorMessage}`);
        }

        // Find next node (default flow)
        const nextEdge = edges.find((e: any) => e.source === currentNodeId && !e.condition);
        currentNodeId = nextEdge?.target;
      }

      // Mark run as completed
      await prisma.$queryRawUnsafe(`
        UPDATE public.workflow_runs 
        SET status = 'COMPLETED', completed_at = NOW(), result = $1
        WHERE id = $2
      `, JSON.stringify(executionContext), runId);

      logger.info('Workflow execution completed', { workflowId, runId });

      return { runId, status: 'COMPLETED', result: executionContext };
    } catch (error: any) {
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
      return { data: { triggered: true }, tokensUsed: 0, costBrl: 0 };

    case 'ACTION':
      // Execute action based on configuration
      if (data.actionType === 'SEND_MESSAGE') {
        logger.info('Sending message', { leadId: context.leadId });
        return { data: { sent: true }, tokensUsed: 0, costBrl: 0 };
      }
      if (data.actionType === 'CREATE_LEAD') {
        logger.info('Creating lead', { data: data.leadData });
        return { data: { created: true }, tokensUsed: 0, costBrl: 0 };
      }
      return { data: { executed: true }, tokensUsed: 0, costBrl: 0 };

    case 'CONDITION':
      // Evaluate condition
      const condition = data.condition;
      const value = context[condition.field];
      
      let result = true;
      switch (condition.operator) {
        case 'equals':
          result = value === condition.value;
          break;
        case 'contains':
          result = value && value.includes(condition.value);
          break;
        case 'greater_than':
          result = value > condition.value;
          break;
      }
      
      return { data: { result }, tokensUsed: 0, costBrl: 0 };

    case 'DELAY':
      // In production, this would schedule a delayed execution
      const delayMs = data.delayMs || 1000;
      await new Promise(resolve => setTimeout(resolve, Math.min(delayMs, 5000)));
      return { data: { delayed: delayMs }, tokensUsed: 0, costBrl: 0 };

    case 'HTTP':
      // Make HTTP request
      logger.info('Making HTTP request', { url: data.url });
      // In production, make actual request
      return { data: { response: { status: 200 } }, tokensUsed: 0, costBrl: 0 };

    case 'AI_OBJECTIVE':
      // Execute AI Objective
      const objectiveResult = await aiObjectiveExecutor.execute({
        tenantId,
        conversationId: context.conversationId,
        contactId: context.contactId,
        leadId: context.leadId,
        variables: context,
        objective: {
          type: data.objectiveType,
          config: data.config
        }
      });
      
      // Simulate AI costs
      const tokensUsed = 500 + Math.floor(Math.random() * 500);
      const costBrl = (tokensUsed / 1000) * 0.002; // ~R$0.002 per 1k tokens
      
      return {
        data: objectiveResult,
        tokensUsed,
        costBrl
      };

    default:
      logger.warn('Unknown node type', { type });
      return { data: { executed: true }, tokensUsed: 0, costBrl: 0 };
  }
}

function findNextNodeByBranch(edges: any[], currentNodeId: string, branch: string): string | undefined {
  // Find edge with matching branch condition
  const branchEdge = edges.find((e: any) => 
    e.source === currentNodeId && 
    e.condition?.branch === branch
  );
  
  if (branchEdge) {
    return branchEdge.target;
  }
  
  // Fallback to default edge
  const defaultEdge = edges.find((e: any) => 
    e.source === currentNodeId && 
    !e.condition
  );
  
  return defaultEdge?.target;
}
