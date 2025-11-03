import { handleControllerError } from '../utils/errors.js';
import { env } from '../config/env.js';
import type { Request, Response } from 'express';
import type { RegisterRequest, LoginRequest } from '../types/requests.js';
import * as authService from '../services/auth.service.js';

// Register a new user. Request body should already be validated by middleware.
export async function register(req: Request, res: Response) {
  try {
    const { email, password } = req.body as RegisterRequest;
    const user = await authService.registerUser(email, password);
    res.status(201).json(user);
  } catch (err) {
    handleControllerError(err, res, {
      uniqueConstraintMessage: 'Email already registered',
      developmentErrorDetails: true,
    });
  }
}

// Login user. Request body should already be validated by middleware.
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body as LoginRequest;
    const result = await authService.loginUser(email, password);
    
    if (!result) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isProd = env.NODE_ENV === 'production';
    res
      .cookie('refresh_token', result.refresh, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/api/auth/refresh',
      })
      .json({ access: result.access });
  } catch (err) {
    handleControllerError(err, res, { developmentErrorDetails: true });
  }
}

// Refresh access token using refresh token cookie, with verification
export async function refresh(req: Request, res: Response) {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) return res.status(401).json({ message: 'No refresh token' });

    const access = await authService.refreshAccessToken(token);
    res.json({ access });
  } catch (err) {
    // Handle refresh token errors
    if (err instanceof Error && err.message === 'Invalid or expired refresh token') {
      return res.status(401).json({ message: err.message });
    }
    handleControllerError(err, res, { developmentErrorDetails: true });
  }
}
