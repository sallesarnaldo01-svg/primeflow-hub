import { z } from 'zod';

export const createFlowSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  queueId: z.string().optional(),
  variables: z.record(z.any()).optional()
});

export const updateFlowSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  active: z.boolean().optional(),
  queueId: z.string().optional(),
  variables: z.record(z.any()).optional()
});

export const createNodeSchema = z.object({
  type: z.enum([
    'START', 'CONTENT', 'MENU', 'RANDOMIZER', 'DELAY', 
    'TICKET', 'TYPEBOT', 'OPENAI', 'CONDITION', 'HTTP', 
    'SCHEDULE', 'ASSIGN_QUEUE', 'SUBFLOW'
  ]),
  label: z.string().optional(),
  x: z.number().default(0),
  y: z.number().default(0),
  config: z.any()
});

export const createEdgeSchema = z.object({
  sourceId: z.string(),
  targetId: z.string(),
  condition: z.any().optional(),
  label: z.string().optional()
});

export type CreateFlowInput = z.infer<typeof createFlowSchema>;
export type UpdateFlowInput = z.infer<typeof updateFlowSchema>;
export type CreateNodeInput = z.infer<typeof createNodeSchema>;
export type CreateEdgeInput = z.infer<typeof createEdgeSchema>;
