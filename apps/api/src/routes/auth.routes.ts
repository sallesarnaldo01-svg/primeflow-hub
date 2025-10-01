import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/error.js';
import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
  resetPasswordSchema
} from '@primeflow/shared/validators';

const router = Router();

router.post('/login', validate(loginSchema), asyncHandler(authController.login));
router.post('/register', validate(registerSchema), asyncHandler(authController.register));
router.get('/me', authenticate, asyncHandler(authController.me));
router.put('/profile', authenticate, validate(updateProfileSchema), asyncHandler(authController.updateProfile));
router.post('/reset-password', authenticate, validate(resetPasswordSchema), asyncHandler(authController.resetPassword));

export default router;
