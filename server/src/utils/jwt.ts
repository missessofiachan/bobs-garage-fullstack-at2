/**
 * @author Bob's Garage Team
 * @purpose JWT token signing, verification, and decoding utilities
 * @version 1.0.0
 */

import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signAccessToken(payload: object) {
	// cast to any to satisfy current @types/jsonwebtoken overloads
	return jwt.sign(payload as any, env.JWT_SECRET as any, { expiresIn: env.JWT_EXPIRES_IN } as any);
}
export function signRefreshToken(payload: object) {
	// Use separate secret if configured, otherwise fall back to JWT_SECRET
	const secret = env.JWT_REFRESH_SECRET || env.JWT_SECRET;
	return jwt.sign(payload as any, secret as any, { expiresIn: env.REFRESH_EXPIRES_IN } as any);
}
export function verifyToken<T>(token: string) {
	return jwt.verify(token as any, env.JWT_SECRET as any) as T;
}
export function verifyRefreshToken<T>(token: string) {
	// Use separate secret if configured, otherwise fall back to JWT_SECRET
	const secret = env.JWT_REFRESH_SECRET || env.JWT_SECRET;
	return jwt.verify(token as any, secret as any) as T;
}
