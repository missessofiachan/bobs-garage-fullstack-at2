/**
 * @file metrics.ts
 * @author Bob's Garage Team
 * @description Prometheus metrics middleware
 * @version 1.0.0
 * @since 1.0.0
 */

import type { NextFunction, Request, Response } from "express";
import {
	httpErrorsTotal,
	httpRequestDuration,
	httpRequestTotal,
} from "../services/metrics.service.js";

/**
 * Middleware to collect HTTP request metrics
 */
export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
	const startTime = Date.now();
	const route = req.route?.path || req.path;

	// Override res.end to capture response
	const originalEnd = res.end.bind(res);

	res.end = function (chunk?: unknown, encoding?: unknown, cb?: () => void) {
		const duration = (Date.now() - startTime) / 1000; // Convert to seconds
		const statusCode = res.statusCode.toString();
		const method = req.method;

		// Record metrics
		httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
		httpRequestTotal.inc({ method, route, status_code: statusCode });

		// Record errors (4xx and 5xx)
		if (res.statusCode >= 400) {
			httpErrorsTotal.inc({ method, route, status_code: statusCode });
		}

		if (encoding !== undefined) {
			return originalEnd(chunk, encoding as BufferEncoding, cb);
		}
		return originalEnd(chunk, cb);
	};

	next();
}
