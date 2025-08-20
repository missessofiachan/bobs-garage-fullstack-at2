import { User } from '../db/models/User.js';
import { hashPassword, verifyPassword } from '../utils/hash.js';
import { signAccessToken, signRefreshToken } from '../utils/jwt.js';
import { env } from '../config/env.js';
import type { Request, Response } from 'express';

// Register a new user. Request body should already be validated by middleware.
export async function register(req: Request, res: Response) {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const passwordHash = await hashPassword(password);
    const user = await User.create({ email, passwordHash, role: 'user' });
    res.status(201).json({ id: user.id, email: user.email });
  } catch (err) {
    // Check for Sequelize unique constraint error
    if (typeof err === 'object' && err && 'name' in err && (err as any).name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Email already registered' });
    }
    // eslint-disable-next-line no-console
    console.error('Register error:', err instanceof Error ? err.message : err);
    if (env.NODE_ENV === 'development') {
      return res.status(500).json({ message: 'Internal server error', error: String((err as any)?.message ?? err) });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Login user. Request body should already be validated by middleware.
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const user = await User.findOne({ where: { email } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const access = signAccessToken({ sub: user.id, role: user.role });
    const refresh = signRefreshToken({ sub: user.id, role: user.role });

    const isProd = env.NODE_ENV === 'production';
    res
      .cookie('refresh_token', refresh, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/api/auth/refresh',
      })
      .json({ access });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
}


// Refresh access token using refresh token cookie, with verification
export async function refresh(req: Request, res: Response) {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) return res.status(401).json({ message: 'No refresh token' });

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

