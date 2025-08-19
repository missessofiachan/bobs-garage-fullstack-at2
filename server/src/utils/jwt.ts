import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signAccessToken(payload: object) {
  // cast to any to satisfy current @types/jsonwebtoken overloads
  return jwt.sign(payload as any, env.JWT_SECRET as any, { expiresIn: env.JWT_EXPIRES_IN } as any);
}
export function signRefreshToken(payload: object) {
  return jwt.sign(payload as any, env.JWT_SECRET as any, { expiresIn: env.REFRESH_EXPIRES_IN } as any);
}
export function verifyToken<T>(token: string) {
  return jwt.verify(token as any, env.JWT_SECRET as any) as T;
}

