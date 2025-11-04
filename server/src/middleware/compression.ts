/**
 * @file compression.ts
 * @author Bob's Garage Team
 * @description Response compression middleware (gzip/brotli)
 * @version 1.0.0
 * @since 1.0.0
 */

import compression from "compression";
import type { Express } from "express";
import { env } from "../config/env.js";

/**
 * Applies compression middleware to the Express app
 */
export function applyCompression(app: Express): void {
	if (!env.COMPRESSION_ENABLED) {
		return;
	}

	app.use(
		compression({
			// Compress responses that are at least 1KB
			threshold: 1024,
			// Use gzip compression (brotli requires additional setup)
			filter: (req, res) => {
				// Don't compress if client doesn't support it
				if (req.headers["x-no-compression"]) {
					return false;
				}
				// Use compression filter
				return compression.filter(req, res);
			},
		}),
	);
}
