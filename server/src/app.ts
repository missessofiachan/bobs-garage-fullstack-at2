/**
 * @file app.ts
 * @author Bob's Garage Team
 * @description Express application factory function that configures middleware, routes, error handling,
 *              and static file serving. Builds the complete Express app instance without starting the server.
 * @version 1.0.0
 * @since 1.0.0
 */

import path from "node:path";
// // express app, middleware, routes wiring
import express, { type Application } from "express";
import { env } from "./config/env.js";
import { sequelize } from "./config/sequelize.js";
import { winstonLogger } from "./config/winston.js";
import * as HealthController from "./controllers/health.controller.js";
import { applyCompression } from "./middleware/compression.js";
import { applyETag } from "./middleware/etag.js";
import { metricsMiddleware } from "./middleware/metrics.js";
import { morganMiddleware } from "./middleware/morganLogger.js";
import {
	requestPerformanceMiddleware,
	setupQueryPerformanceMonitoring,
} from "./middleware/queryPerformance.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import { requestIdMiddleware } from "./middleware/requestId.js";
import { requestResponseLoggingMiddleware } from "./middleware/requestResponseLogging.js";
import { applySecurity } from "./middleware/security.js";
import { ROOT_UPLOAD_DIR_ABS, UPLOADS_PUBLIC_PATH } from "./middleware/upload.js";
import v1Routes from "./routes/v1/index.js";
import { getMetrics, register } from "./services/metrics.service.js";

// Build Express app (no network listeners here)
export function createApp(): Application {
	const app = express();

	// Setup query performance monitoring
	setupQueryPerformanceMonitoring();

	// Request ID middleware - should be first to track all requests
	app.use(requestIdMiddleware);

	// Request performance monitoring
	app.use(requestPerformanceMiddleware);

	// Prometheus metrics middleware (if enabled)
	if (env.METRICS_ENABLED) {
		app.use(metricsMiddleware);
	}

	// Request/response logging middleware (if enabled)
	app.use(requestResponseLoggingMiddleware);

	// Use Winston + Morgan for HTTP request logging
	app.use(morganMiddleware);

	applySecurity(app);

	// Apply compression (gzip/brotli) - should be early in the middleware chain
	applyCompression(app);

	// Apply ETag for conditional requests
	applyETag(app);

	app.use(express.json({ limit: env.BODY_PARSER_LIMIT }));

	// Serve uploaded files as static content
	app.use(
		UPLOADS_PUBLIC_PATH,
		express.static(ROOT_UPLOAD_DIR_ABS, {
			fallthrough: true,
			setHeaders(res, filePath) {
				// Allow cross-origin embedding of uploaded images (client runs on a different origin in dev)
				// Override helmet's Cross-Origin-Resource-Policy for this route.
				res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
				// Permit any origin to fetch these assets (images are public by definition). This is safe for static images.
				res.setHeader("Access-Control-Allow-Origin", "*");
				// Basic security: no sniffing
				res.setHeader("X-Content-Type-Options", "nosniff");
				if (path.extname(filePath).match(/\.(png|jpe?g|gif|webp|svg)$/i)) {
					res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
				}
			},
		}),
	);

	// Prometheus metrics endpoint
	if (env.METRICS_ENABLED) {
		app.get("/metrics", async (_req, res) => {
			try {
				res.setHeader("Content-Type", register.contentType);
				const metrics = await getMetrics();
				res.end(metrics);
			} catch (err) {
				winstonLogger.error(`Error generating metrics: ${err}`);
				res.status(500).end();
			}
		});
	}

	// API versioning - v1 routes (primary)
	app.use("/api/v1", apiLimiter, v1Routes);

	// Legacy API routes (backward compatibility - mount same routes at /api)
	// This ensures /api/* still works for existing frontend clients
	app.use("/api", apiLimiter, v1Routes);

	app.get("/db-status", async (_req, res) => {
		try {
			await sequelize.authenticate();
			res.status(200).json({ status: "connected" });
		} catch (err) {
			res.status(500).json({ status: "disconnected", error: (err as Error).message });
		}
	});

	// Enhanced health check endpoint
	app.get("/health", HealthController.healthCheck);

	// 404 handler with structured error response
	app.use((req, res) => {
		const requestId = res.getHeader("X-Request-ID") as string | undefined;
		res.status(404).json({
			error: {
				code: "NOT_FOUND",
				message: "Not Found",
				requestId,
				timestamp: new Date().toISOString(),
				path: req.path,
			},
		});
	});

	// Global error handler
	app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
		const requestId = res.getHeader("X-Request-ID") as string | undefined;
		winstonLogger.error(
			`Unhandled error in request pipeline [${requestId || "unknown"}]: ${err instanceof Error ? err.message : String(err)}`,
		);

		// Use structured error response
		const errorResponse = {
			error: {
				code: "INTERNAL_ERROR",
				message: "Internal server error",
				requestId,
				timestamp: new Date().toISOString(),
				path: _req.path,
			},
		};

		res.status(500).json(errorResponse);
	});

	return app;
}
