import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres')
});

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  tenantName: z.string().min(2, 'Nome da empresa deve ter no mínimo 2 caracteres')
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  timezone: z.string().optional()
});

export const resetPasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
  confirmPassword: z.string().min(6)
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword']
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
