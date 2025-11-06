/**
 * @author Bob's Garage Team
 * @purpose Shared validation utilities for controllers
 * @version 1.0.0
 */

import type { Request, Response } from "express";
import { sendNotFoundError } from "./errorResponse.js";

/**
 * Parse and validate an ID parameter from the request
 * Returns the parsed ID or null if invalid
 */
export function parseIdParam(req: Request, res: Response): number | null {
	const id = Number(req.params.id);
	if (!Number.isFinite(id)) {
		res.status(400).json({ message: "Invalid id" });
		return null;
	}
	return id;
}

/**
 * Parse an ID from the request and ensure it's valid
 * Returns false if invalid (and sends error response)
 */
export function validateIdParam(req: Request, res: Response): number | null {
	const id = Number(req.params.id);
	if (!Number.isFinite(id)) {
		res.status(400).json({ message: "Invalid id" });
		return null;
	}
	return id;
}

/**
 * Get authenticated user ID from request
 * Returns the user ID or null if not available
 */
export function getUserIdFromRequest(req: Request): number | null {
	const userId = Number((req as any).user?.sub);
	if (!userId) {
		return null;
	}
	return userId;
}

/**
 * Require authentication - get user ID from request or send 401
 * @param req - Express request object
 * @param res - Express response object
 * @returns User ID if authenticated, null if error response was sent
 */
export function requireAuth(req: Request, res: Response): number | null {
	const userId = getUserIdFromRequest(req);
	if (!userId) {
		res.status(401).json({ message: "Unauthorized" });
		return null;
	}
	return userId;
}

/**
 * Find a model instance by ID or send 404 if not found
 * Combines ID parsing, model lookup, and 404 handling
 * @param req - Express request object
 * @param res - Express response object
 * @param findFn - Function that takes an ID and returns a Promise of the model instance or null
 * @param notFoundMessage - Optional custom 404 message
 * @returns Model instance if found, null if error response was sent
 */
export async function findByIdOr404<T>(
	req: Request,
	res: Response,
	findFn: (id: number) => Promise<T | null>,
	notFoundMessage?: string,
): Promise<T | null> {
	const id = parseIdParam(req, res);
	if (id === null) return null; // Error response already sent

	const instance = await findFn(id);
	if (!instance) {
		sendNotFoundError(res, notFoundMessage);
		return null;
	}

	return instance;
}
