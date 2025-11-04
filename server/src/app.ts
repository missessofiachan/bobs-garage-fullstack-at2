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
import { morganMiddleware } from "./middleware/morganLogger.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import { applySecurity } from "./middleware/security.js";
import { ROOT_UPLOAD_DIR_ABS, UPLOADS_PUBLIC_PATH } from "./middleware/upload.js";
import routes from "./routes/index.js";

// Build Express app (no network listeners here)
export function createApp(): Application {
	const app = express();

	// Use Winston + Morgan for HTTP request logging
	app.use(morganMiddleware);

	applySecurity(app);
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

	// Rate limit all API routes
	app.use("/api", apiLimiter, routes);

	app.get("/db-status", async (_req, res) => {
		try {
			await sequelize.authenticate();
			res.status(200).json({ status: "connected" });
		} catch (err) {
			res.status(500).json({ status: "disconnected", error: (err as Error).message });
		}
	});

	// health check
	app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

	// 404 handler
	app.use((_req, res) => res.status(404).json({ message: "Not Found" }));

	// Global error handler
	app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
		winstonLogger.error(
			`Unhandled error in request pipeline: ${err instanceof Error ? err.message : String(err)}`,
		);
		res.status(500).json({ message: "Internal server error" });
	});

	return app;
}
