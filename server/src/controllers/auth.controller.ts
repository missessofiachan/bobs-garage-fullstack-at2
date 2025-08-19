import { z } from 'zod';
import { User } from '../db/models/User.js';
import { hashPassword, verifyPassword } from '../utils/hash.js';
import { signAccessToken, signRefreshToken } from '../utils/jwt.js';
import { env } from '../config/env.js';
import type { Request, Response } from 'express';



const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});


const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});


// Register a new user with error handling and validation feedback
export async function register(req: Request, res: Response) {
  try {
    const body = registerSchema.parse(req.body);
    const passwordHash = await hashPassword(body.password);
    const user = await User.create({ email: body.email, passwordHash, role: 'user' });
    res.status(201).json({ id: user.id, email: user.email });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: err.issues });
    }
    // Check for Sequelize unique constraint error
    if (typeof err === 'object' && err && 'name' in err && (err as any).name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Email already registered' });
    }
    // Log error for debugging
    // eslint-disable-next-line no-console
    console.error('Register error:', err instanceof Error ? err.message : err);
    // In development return error details to help debugging tests; keep generic in production
    if (env.NODE_ENV === 'development') {
      return res.status(500).json({ message: 'Internal server error', error: String((err as any)?.message ?? err) });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
}


// Login user with error handling and secure cookie in production
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ where: { email } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  const access = signAccessToken({ sub: user.id, role: user.role });
  const refresh = signRefreshToken({ sub: user.id, role: user.role });

    // Set secure cookie in production
    const isProd = process.env.NODE_ENV === 'production';
    res
      .cookie('refresh_token', refresh, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/api/auth/refresh',
      })
      .json({ access });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: err.issues });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
}


// Refresh access token using refresh token cookie, with verification
export async function refresh(req: Request, res: Response) {
  try {
  const token = req.cookies?.refresh_token;
    if (!token) return res.status(401).json({ message: 'No refresh token' });

    // Properly verify refresh token
    const { verify } = await import('jsonwebtoken');
    let payload: any;
    try {
      payload = verify(token, process.env.JWT_SECRET!);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const access = signAccessToken({ sub: payload.sub, role: payload.role });
    res.json({ access });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

