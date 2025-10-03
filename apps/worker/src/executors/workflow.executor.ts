import { logger } from '../lib/logger.js';
import { prisma } from '../lib/prisma.js';
import { functionCallExecutor } from './function-call.executor.js';

interface WorkflowContext {
  tenantId: string;
  flowId: string;
  variables: Record<string, any>;
}

export class WorkflowExecutor {
  async execute(context: WorkflowContext): Promise<any> {
    const { tenantId, flowId, variables } = context;

    try {
      logger.info('Executing workflow', { flowId });

      // Buscar o workflow
      const flow = await prisma.flow.findFirst({
        where: {
          id: flowId,
          tenantId,
          active: true
        },
        include: {
          nodes: true,
          edges: true
        }
      });

      if (!flow) {
        throw new Error('Workflow not found or inactive');
      }

      // Encontrar nó de início
      const startNode = flow.nodes.find(n => n.type === 'START');
      if (!startNode) {
        throw new Error('Workflow has no START node');
      }

      // Executar o fluxo
      let currentNodeId = startNode.id;
      let workflowVariables = { ...variables };
      const executionLog = [];

      while (currentNodeId) {
        const currentNode = flow.nodes.find(n => n.id === currentNodeId);
        if (!currentNode) break;

        logger.debug('Executing node', { nodeId: currentNodeId, type: currentNode.type });

        // Executar o nó baseado no tipo
        const nodeResult = await this.executeNode(currentNode, workflowVariables, tenantId);
        
        executionLog.push({
          nodeId: currentNodeId,
          type: currentNode.type,
          result: nodeResult
        });

        // Se o nó retornar variáveis, atualizar o contexto
        if (nodeResult.variables) {
          workflowVariables = { ...workflowVariables, ...nodeResult.variables };
        }

        // Encontrar próximo nó
        const nextEdge = flow.edges.find(e => e.sourceId === currentNodeId);
        
        if (!nextEdge) {
          // Fim do fluxo
          currentNodeId = null;
        } else if (currentNode.type === 'CONDITION') {
          // Para nós de condição, avaliar qual caminho seguir
          const conditionResult = nodeResult.conditionMet;
          const edges = flow.edges.filter(e => e.sourceId === currentNodeId);
          const selectedEdge = edges.find(e => 
            (conditionResult && e.label === 'true') || 
            (!conditionResult && e.label === 'false')
          );
          currentNodeId = selectedEdge?.targetId || null;
        } else {
          currentNodeId = nextEdge.targetId;
        }
      }

      logger.info('Workflow executed successfully', { flowId });

      return {
        success: true,
        variables: workflowVariables,
        executionLog
      };
    } catch (error) {
      logger.error('Workflow execution failed', { error, flowId });
      throw error;
    }
  }

  private async executeNode(
    node: any,
    variables: Record<string, any>,
    tenantId: string
  ): Promise<any> {
    const config = node.config || {};

    switch (node.type) {
      case 'START':
        return { success: true };

      case 'CONTENT':
        // Enviar mensagem
        return {
          success: true,
          message: config.message
        };

      case 'CONDITION':
        // Avaliar condição
        const conditionMet = this.evaluateCondition(config.condition, variables);
        return {
          success: true,
          conditionMet
        };

      case 'DELAY':
        // Aguardar tempo especificado
        const delayMs = config.delay * 1000;
        await new Promise(resolve => setTimeout(resolve, delayMs));
        return {
          success: true,
          delayedFor: delayMs
        };

      case 'HTTP':
        // Fazer chamada HTTP
        const response = await fetch(config.url, {
          method: config.method || 'GET',
          headers: config.headers || {},
          body: config.body ? JSON.stringify(config.body) : undefined
        });
        const data = await response.json();
        return {
          success: true,
          variables: { httpResponse: data }
        };

      case 'OPENAI':
        // Chamar Function Calling
        if (config.toolName) {
          const result = await functionCallExecutor.execute({
            tenantId,
            toolName: config.toolName,
            parameters: config.parameters || {}
          });
          return {
            success: result.success,
            variables: { toolResult: result.data }
          };
        }
        return { success: true };

      default:
        logger.warn('Unknown node type', { type: node.type });
        return { success: true };
    }
  }

  private evaluateCondition(condition: any, variables: Record<string, any>): boolean {
    // Avaliação simples de condição
    // TODO: Implementar avaliador mais robusto
    const { field, operator, value } = condition;
    const fieldValue = variables[field];

    switch (operator) {
      case 'equals':
        return fieldValue === value;
      case 'not_equals':
        return fieldValue !== value;
      case 'contains':
        return String(fieldValue).includes(value);
      case 'greater_than':
        return Number(fieldValue) > Number(value);
      case 'less_than':
        return Number(fieldValue) < Number(value);
      default:
        return false;
    }
  }
}

export const workflowExecutor = new WorkflowExecutor();
