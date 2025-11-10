/**
 * @author Bob's Garage Team
 * @purpose Zod validation schemas for client-side form validation
 * @version 1.0.0
 */

import { z } from 'zod';

export const emailSchema = z.string().email('Please enter a valid email');
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
