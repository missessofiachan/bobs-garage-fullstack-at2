/**
 * @file requestResponseLogging.ts
 * @author Bob's Garage Team
 * @description Request/response body logging middleware (sanitized)
 * @version 1.0.0
 * @since 1.0.0
 */

import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { winstonLogger } from "../config/winston.js";

// Fields to redact from logs
const SENSITIVE_FIELDS = [
	"password",
	"passwordHash",
	"token",
	"accessToken",
	"refreshToken",
	"authorization",
	"cookie",
	"secret",
	"apiKey",
	"apikey",
];

/**
 * Sanitize object by redacting sensitive fields
 */
function sanitize(obj: unknown, depth = 0): unknown {
	if (depth > 5) return "[Max depth reached]"; // Prevent deep recursion

	if (obj === null || obj === undefined) {
		return obj;
	}

	if (typeof obj !== "object") {
		return obj;
	}

	if (Array.isArray(obj)) {
		return obj.map((item) => sanitize(item, depth + 1));
	}

	const sanitized: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(obj)) {
		const lowerKey = key.toLowerCase();

		// Redact sensitive fields
		if (SENSITIVE_FIELDS.some((field) => lowerKey.includes(field.toLowerCase()))) {
			sanitized[key] = "[REDACTED]";
		} else if (typeof value === "object" && value !== null) {
			sanitized[key] = sanitize(value, depth + 1);
		} else {
			sanitized[key] = value;
		}
	}

	return sanitized;
}

/**
 * Truncate long strings for logging
 */
function truncate(str: string, maxLength = 500): string {
	if (str.length <= maxLength) return str;
	return `${str.substring(0, maxLength)}...[truncated ${str.length - maxLength} chars]`;
}

/**
 * Middleware to log request and response bodies (sanitized)
 */
export function requestResponseLoggingMiddleware(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	// Only log if enabled via env var
	if (!env.DETAILED_LOGGING_ENABLED) {
		return next();
	}

	const requestId = req.requestId || "unknown";
	const startTime = Date.now();

	// Log request
	if (req.body && Object.keys(req.body).length > 0) {
		const sanitizedBody = sanitize(req.body);
		winstonLogger.debug(`[${requestId}] Request body: ${truncate(JSON.stringify(sanitizedBody))}`);
	}

	// Log query params
	if (req.query && Object.keys(req.query).length > 0) {
		const sanitizedQuery = sanitize(req.query);
		winstonLogger.debug(`[${requestId}] Query params: ${truncate(JSON.stringify(sanitizedQuery))}`);
	}

	// Capture response
	const originalJson = res.json.bind(res);
	const originalSend = res.send.bind(res);

	res.json = function (body: unknown) {
		const duration = Date.now() - startTime;
		const sanitizedBody = sanitize(body);
		winstonLogger.debug(
			`[${requestId}] Response (${duration}ms): ${truncate(JSON.stringify(sanitizedBody))}`,
		);
		return originalJson(body);
	};

	res.send = function (body: unknown) {
		const duration = Date.now() - startTime;
		if (typeof body === "string" && body.length > 0) {
			winstonLogger.debug(`[${requestId}] Response (${duration}ms): ${truncate(body)}`);
		} else if (typeof body === "object" && body !== null) {
			const sanitizedBody = sanitize(body);
			winstonLogger.debug(
				`[${requestId}] Response (${duration}ms): ${truncate(JSON.stringify(sanitizedBody))}`,
			);
		}
		return originalSend(body);
	};

	next();
}
