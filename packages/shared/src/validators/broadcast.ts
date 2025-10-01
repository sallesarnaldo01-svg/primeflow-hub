import { z } from 'zod';

export const createBroadcastSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  filters: z.object({
    tags: z.array(z.string()).optional(),
    sources: z.array(z.enum(['WHATSAPP', 'FACEBOOK', 'INSTAGRAM'])).optional()
  }),
  script: z.array(z.object({
    type: z.string(),
    config: z.any()
  })),
  config: z.object({
    intervalSec: z.number().min(1).max(300),
    pauseEveryN: z.number().optional(),
    pauseForSec: z.number().optional(),
    signature: z.object({
      enabled: z.boolean(),
      customName: z.string().optional()
    }).optional(),
    termsAcceptedAt: z.date().optional()
  })
});

export type CreateBroadcastInput = z.infer<typeof createBroadcastSchema>;
