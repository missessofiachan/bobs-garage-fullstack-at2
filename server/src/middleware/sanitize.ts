/**
 * @author Bob's Garage Team
 * @purpose Input sanitization middleware to prevent XSS attacks
 * @version 1.0.0
 * @description Sanitizes all string fields in request bodies to prevent XSS
 */

import type { NextFunction, Request, Response } from "express";
import { sanitizeHtml, sanitizeObject } from "../utils/sanitize.js";

/**
 * Recursively sanitize object properties in place
 * Modifies the object directly rather than replacing it (for read-only properties)
 */
function sanitizeObjectInPlace(obj: unknown): void {
	if (obj === null || obj === undefined) {
		return;
	}

	if (typeof obj === "string") {
		// Can't modify strings in place, but we'll handle this at the object level
		return;
	}

	if (Array.isArray(obj)) {
		for (let i = 0; i < obj.length; i++) {
			if (typeof obj[i] === "string") {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(obj as any)[i] = sanitizeHtml(obj[i] as string);
			} else {
				sanitizeObjectInPlace(obj[i]);
			}
		}
		return;
	}

	if (typeof obj === "object") {
		for (const [key, value] of Object.entries(obj)) {
			if (typeof value === "string") {
				// Sanitize the string value in place
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(obj as any)[key] = sanitizeHtml(value);
			} else {
				sanitizeObjectInPlace(value);
			}
		}
	}
}

/**
 * Middleware to sanitize request body to prevent XSS attacks
 * Sanitizes all string fields in req.body, req.query, and req.params
 */
export function sanitizeInput(req: Request, _res: Response, next: NextFunction): void {
	// Sanitize request body (can be replaced since it's mutable)
	if (req.body && typeof req.body === "object") {
		req.body = sanitizeObject(req.body) as typeof req.body;
	}

	// Sanitize query parameters (must modify in place - read-only property)
	if (req.query && typeof req.query === "object") {
		sanitizeObjectInPlace(req.query);
	}

	// Sanitize URL parameters (must modify in place - read-only property)
	if (req.params && typeof req.params === "object") {
		sanitizeObjectInPlace(req.params);
	}

	next();
}
