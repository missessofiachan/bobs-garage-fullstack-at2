/**
 * @author Bob's Garage Team
 * @purpose Rate limiting middleware for API and authentication endpoints
 * @version 1.0.0
 */

import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

export const apiLimiter = rateLimit({
	windowMs: env.RATE_LIMIT_WINDOW_MS,
	max: env.RATE_LIMIT_MAX,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		status: 429,
		message: "Too many requests. Please slow down and try again in a moment.",
	},
});

// Separate rate limiter for auth endpoints (stricter)
export const authLimiter = rateLimit({
	windowMs: env.RATE_LIMIT_AUTH_WINDOW_MS,
	max: env.RATE_LIMIT_AUTH_MAX,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		status: 429,
		message: "Too many login attempts. Please wait a moment before trying again.",
	},
});
