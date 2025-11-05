/**
 * @file queryPerformance.ts
 * @author Bob's Garage Team
 * @description Query performance monitoring middleware
 * @version 1.0.0
 * @since 1.0.0
 */

import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { sequelize } from "../config/sequelize.js";
import { winstonLogger } from "../config/winston.js";

// Track slow queries
interface SlowQuery {
	query: string;
	duration: number;
	timestamp: Date;
}

// Configuration for slow query detection
const SLOW_QUERY_THRESHOLD_MS = env.SLOW_QUERY_THRESHOLD_MS || 1000; // Log queries taking more than threshold
const SLOW_QUERY_LOG_ENABLED = env.NODE_ENV === "development" || env.LOG_LEVEL === "debug";

/**
 * Setup Sequelize query logging for performance monitoring
 */
export function setupQueryPerformanceMonitoring(): void {
	if (!SLOW_QUERY_LOG_ENABLED) {
		return;
	}

	// Override Sequelize logging to track slow queries
	const originalLogging = sequelize.options.logging;

	sequelize.options.logging = (query: string, timing?: number) => {
		const duration = timing || 0;

		// Log slow queries
		if (duration > SLOW_QUERY_THRESHOLD_MS) {
			winstonLogger.warn(`Slow query detected (${duration}ms): ${query.substring(0, 200)}`);
		}

		// In development, log all queries
		if (env.NODE_ENV === "development" && originalLogging) {
			if (typeof originalLogging === "function") {
				originalLogging(query, timing);
			} else {
				console.log(`[Query ${duration}ms] ${query.substring(0, 200)}`);
			}
		}
	};

	winstonLogger.info("Query performance monitoring enabled");
}

/**
 * Middleware to log request processing time
 */
export function requestPerformanceMiddleware(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	const startTime = Date.now();
	const requestId = req.requestId;

	// Store original end method to intercept response
	const originalEnd = res.end.bind(res);

	// Override end to set header before response is sent
	res.end = function (chunk?: unknown, encoding?: unknown, cb?: () => void) {
		const duration = Date.now() - startTime;

		// Set response time header before sending response
		if (!res.headersSent) {
			res.setHeader("X-Response-Time", `${duration}ms`);
		}

		// Call original end
		if (encoding !== undefined) {
			return originalEnd(chunk, encoding as BufferEncoding, cb);
		}
		return originalEnd(chunk, cb);
	};

	// Log response time when response finishes (for logging only, not header setting)
	res.on("finish", () => {
		const duration = Date.now() - startTime;

		// Log slow requests
		if (duration > 1000) {
			winstonLogger.warn(
				`Slow request [${requestId || "unknown"}]: ${req.method} ${req.path} took ${duration}ms`,
			);
		}
	});

	next();
}
