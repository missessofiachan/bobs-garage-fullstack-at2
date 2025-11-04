/**
 * @author Bob's Garage Team
 * @purpose Shared validation utilities for controllers
 * @version 1.0.0
 */

import type { Request, Response } from "express";

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
