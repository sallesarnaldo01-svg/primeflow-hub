import { logger } from '../lib/logger.js';
import { prisma } from '../lib/prisma.js';

interface FunctionCallParams {
  tenantId: string;
  toolName: string;
  parameters: Record<string, any>;
}

export class FunctionCallExecutor {
  async execute({ tenantId, toolName, parameters }: FunctionCallParams): Promise<any> {
    try {
      logger.info('Executing function call', { toolName, parameters });

      // Buscar a ferramenta no banco
      const tool = await prisma.aITool.findFirst({
        where: {
          tenantId,
          name: toolName,
          active: true
        }
      });

      if (!tool) {
        throw new Error(`Tool ${toolName} not found or inactive`);
      }

      // Executar a chamada HTTP
      const response = await fetch(tool.endpoint, {
        method: tool.method,
        headers: {
          'Content-Type': 'application/json',
          ...(tool.headers as any || {})
        },
        body: tool.method !== 'GET' ? JSON.stringify(parameters) : undefined
      });

      if (!response.ok) {
        throw new Error(`Tool execution failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      logger.info('Function call executed successfully', { toolName, result });

      return {
        success: true,
        data: result
      };
    } catch (error) {
      logger.error('Function call execution failed', { error, toolName });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const functionCallExecutor = new FunctionCallExecutor();
