/**
 * @author Bob's Garage Team
 * @purpose Zod validation schemas for authentication endpoints (register, login)
 * @version 1.0.0
 */

import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional(),
});

export default { registerSchema, loginSchema };
