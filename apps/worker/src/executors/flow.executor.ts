import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { FlowContext, NodeType } from '@primeflow/shared/types';
import { renderTemplate } from '@primeflow/shared/utils';
import Mustache from 'mustache';

export class FlowExecutor {
  private context: FlowContext;

  constructor(
    private flowId: string,
    private contactId: string,
    initialVars: Record<string, any> = {}
  ) {
    this.context = {
      flowId,
      contactId,
      variables: initialVars,
      currentNodeId: '',
      history: []
    };
  }

  async execute(startNodeId?: string) {
    const flow = await prisma.flow.findUnique({
      where: { id: this.flowId },
      include: {
        nodes: true,
        edges: true
      }
    });

    if (!flow) {
      throw new Error(`Flow ${this.flowId} not found`);
    }

    let currentNode = startNodeId 
      ? flow.nodes.find(n => n.id === startNodeId)
      : flow.nodes.find(n => n.type === 'START');

    if (!currentNode) {
      throw new Error('Start node not found');
    }

    while (currentNode) {
      logger.info('Executing node', {
        flowId: this.flowId,
        nodeId: currentNode.id,
        nodeType: currentNode.type
      });

      this.context.currentNodeId = currentNode.id;
      this.context.history.push(currentNode.id);

      const nextNodeId = await this.executeNode(currentNode, flow.edges);
      
      if (!nextNodeId) {
        logger.info('Flow execution finished', { flowId: this.flowId });
        break;
      }

      currentNode = flow.nodes.find(n => n.id === nextNodeId);
    }
  }

  private async executeNode(node: any, edges: any[]): Promise<string | null> {
    const config = node.config;

    switch (node.type as NodeType) {
      case 'START':
        return this.findNextNode(node.id, edges);

      case 'CONTENT':
        await this.executeContent(config);
        return this.findNextNode(node.id, edges);

      case 'MENU':
        // Wait for user input - return null to pause
        return null;

      case 'DELAY':
        await this.executeDelay(config);
        return this.findNextNode(node.id, edges);

      case 'CONDITION':
        return this.executeCondition(config, edges);

      case 'ASSIGN_QUEUE':
        await this.executeAssignQueue(config);
        return this.findNextNode(node.id, edges);

      case 'SUBFLOW':
        await this.executeSubflow(config);
        return this.findNextNode(node.id, edges);

      default:
        logger.warn('Unknown node type', { type: node.type });
        return this.findNextNode(node.id, edges);
    }
  }

  private async executeContent(config: any) {
    const parts = config.parts || [];

    for (const part of parts) {
      const value = this.renderValue(part.value);

      // Aqui enviaria a mensagem via provider
      logger.info('Send content', {
        kind: part.kind,
        value,
        ptt: part.ptt
      });

      if (part.delay) {
        await this.sleep(part.delay);
      }
    }

    if (config.delay) {
      await this.sleep(config.delay);
    }
  }

  private async executeDelay(config: any) {
    await this.sleep(config.seconds * 1000);
  }

  private executeCondition(config: any, edges: any[]): string | null {
    const rules = config.rules || [];

    for (const rule of rules) {
      const left = this.renderValue(rule.left);
      const right = rule.right;

      let match = false;

      switch (rule.op) {
        case 'equals':
          match = left === right;
          break;
        case 'contains':
          match = String(left).includes(String(right));
          break;
        case 'gt':
          match = Number(left) > Number(right);
          break;
        case 'lt':
          match = Number(left) < Number(right);
          break;
        case 'in':
          match = Array.isArray(right) && right.includes(left);
          break;
      }

      if (match && rule.next) {
        return rule.next;
      }
    }

    return config.else || null;
  }

  private async executeAssignQueue(config: any) {
    logger.info('Assign to queue', { queueId: config.queueId });
    // Implementar lógica de atribuição de fila
  }

  private async executeSubflow(config: any) {
    const subExecutor = new FlowExecutor(
      config.flowId,
      this.contactId,
      this.context.variables
    );
    await subExecutor.execute();
    
    // Merge variables back
    Object.assign(this.context.variables, subExecutor.getVariables());
  }

  private findNextNode(currentNodeId: string, edges: any[]): string | null {
    const edge = edges.find(e => e.sourceId === currentNodeId);
    return edge?.targetId || null;
  }

  private renderValue(template: string): string {
    return Mustache.render(template, {
      contact: {
        id: this.contactId,
        name: this.context.variables.contact?.name || 'Cliente'
      },
      vars: this.context.variables,
      now: new Date().toISOString()
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getVariables() {
    return this.context.variables;
  }
}
