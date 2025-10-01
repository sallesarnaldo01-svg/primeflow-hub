import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20)
});

export const idParamSchema = z.object({
  id: z.string().cuid()
});

export type PaginationInput = z.infer<typeof paginationSchema>;
export type IdParam = z.infer<typeof idParamSchema>;
