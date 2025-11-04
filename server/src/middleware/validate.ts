/**
 * @author Bob's Garage Team
 * @purpose Request body validation middleware using Zod schemas
 * @version 1.0.0
 */

import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

export function validateBody(schema: ZodSchema) {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			req.body = schema.parse(req.body);
			next();
		} catch (err) {
			if ((err as any).issues) {
				return res.status(400).json({ message: "Validation error", errors: (err as any).issues });
			}
			return res.status(400).json({ message: "Invalid request body" });
		}
	};
}
