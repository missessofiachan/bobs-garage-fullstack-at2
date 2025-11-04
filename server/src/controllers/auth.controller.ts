/**
 * @file auth.controller.ts
 * @author Bob's Garage Team
 * @description Authentication controller handling user registration, login, and JWT token refresh operations.
 *              Provides endpoints for public authentication flows with rate limiting and security validation.
 * @version 1.0.0
 * @since 1.0.0
 */

import type { Request, Response } from "express";
import { env } from "../config/env.js";
import * as authService from "../services/auth.service.js";
import type { LoginRequest, RegisterRequest } from "../types/requests.js";
import { handleControllerError } from "../utils/errors.js";

/**
 * @route POST /api/auth/register
 * @description Register a new user. The first user to register will automatically be assigned the admin role.
 * @access Public
 * @param {Request} req - Express request object
 * @param {Request.body.email} req.body.email - User email address (required, must be valid email)
 * @param {Request.body.password} req.body.password - User password (required, minimum 8 characters)
 * @param {Response} res - Express response object
 * @returns {Object} 201 - Created user object with id, email, and role
 * @returns {Object} 400 - Validation error with details
 * @returns {Object} 409 - Email already registered
 * @example
 * // Request body:
 * {
 *   "email": "user@example.com",
 *   "password": "password123"
 * }
 *
 * // Response (201):
 * {
 *   "id": 1,
 *   "email": "user@example.com",
 *   "role": "admin"
 * }
 */
export async function register(req: Request, res: Response) {
	try {
		const { email, password } = req.body as RegisterRequest;
		const user = await authService.registerUser(email, password);
		res.status(201).json(user);
	} catch (err) {
		handleControllerError(err, res, {
			uniqueConstraintMessage: "Email already registered",
			developmentErrorDetails: true,
		});
	}
}

/**
 * @route POST /api/auth/login
 * @description Authenticate user and receive access token. Refresh token is set as HttpOnly cookie.
 * @access Public
 * @param {Request} req - Express request object
 * @param {Request.body.email} req.body.email - User email address (required)
 * @param {Request.body.password} req.body.password - User password (required)
 * @param {Response} res - Express response object
 * @returns {Object} 200 - Access token in response body, refresh token in cookie
 * @returns {Object} 401 - Invalid credentials
 * @returns {Object} 400 - Validation error
 * @example
 * // Request body:
 * {
 *   "email": "user@example.com",
 *   "password": "password123"
 * }
 *
 * // Response (200):
 * {
 *   "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 * // Refresh token is set as HttpOnly cookie: refresh_token
 */
export async function login(req: Request, res: Response) {
	try {
		const { email, password } = req.body as LoginRequest;
		const result = await authService.loginUser(email, password);

		if (!result) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		const isProd = env.NODE_ENV === "production";
		res
			.cookie("refresh_token", result.refresh, {
				httpOnly: true,
				secure: isProd,
				sameSite: "lax",
				path: "/api", // Allow cookie to be sent to all API endpoints
				maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
			})
			.json({ access: result.access });
	} catch (err) {
		handleControllerError(err, res, { developmentErrorDetails: true });
	}
}

/**
 * @route POST /api/auth/refresh
 * @description Refresh access token using refresh token from HttpOnly cookie
 * @access Public (requires valid refresh token cookie)
 * @param {Request} req - Express request object (must include refresh_token cookie)
 * @param {Response} res - Express response object
 * @returns {Object} 200 - New access token
 * @returns {Object} 401 - No refresh token or invalid/expired token
 * @example
 * // Request includes refresh_token cookie automatically
 * // Response (200):
 * {
 *   "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 */
export async function refresh(req: Request, res: Response) {
	try {
		const token = req.cookies?.refresh_token;
		if (!token) return res.status(401).json({ message: "No refresh token" });

		const access = await authService.refreshAccessToken(token);
		res.json({ access });
	} catch (err) {
		// Handle refresh token errors
		if (err instanceof Error && err.message === "Invalid or expired refresh token") {
			return res.status(401).json({ message: err.message });
		}
		handleControllerError(err, res, { developmentErrorDetails: true });
	}
}
