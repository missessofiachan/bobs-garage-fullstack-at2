/**
 * @author Bob's Garage Team
 * @purpose Error handling middleware for 404 and global error responses
 * @version 1.0.0
 */

import type { NextFunction, Request, Response } from "express";

export function notFound(_req: Request, res: Response) {
	return res.status(404).json({ message: "Not Found" });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
	// don't leak internals in prod
	return res.status(500).json({ message: "Internal server error" });
}
