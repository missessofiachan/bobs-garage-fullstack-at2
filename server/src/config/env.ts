/**
 * @file env.ts
 * @author Bob's Garage Team
 * @description Environment variable loader and validator using Zod schema validation.
 *              Ensures all required environment variables are present and correctly typed at application startup.
 * @version 1.0.0
 * @since 1.0.0
 */

// Environment variable loader and validator
import { config as dotenvConfig } from "dotenv";
import { z } from "zod";

// Allow .env path override for flexibility (e.g., testing)
if (process.env.ENV_PATH) {
	dotenvConfig({ path: process.env.ENV_PATH });
} else {
	dotenvConfig();
}

/**
 * Zod schema for environment variables
 * Example values are provided in comments for documentation
 */
export const EnvSchema = z.object({
	NODE_ENV: z.enum(["development", "test", "production"]).default("development"), // 'development'
	PORT: z.coerce.number().default(4000), // 4000

	// Database configuration
	DATABASE_HOST: z.string(), // 'localhost'
	DATABASE_PORT: z.coerce.number(), // 3306
	DATABASE_NAME: z.string(), // 'bobs_garage'
	DATABASE_USER: z.string(), // 'root'
	DATABASE_PASSWORD: z.string(), // 'password'
	DATABASE_POOL_MIN: z.coerce.number().optional(), // Connection pool minimum
	DATABASE_POOL_MAX: z.coerce.number().optional(), // Connection pool maximum

	// Authentication & security
	JWT_SECRET: z.string().min(32), // 'supersecretjwtkeywith32charsmin'
	JWT_REFRESH_SECRET: z.string().min(32).optional(), // Separate secret for refresh tokens
	JWT_EXPIRES_IN: z.string(), // '1h'
	REFRESH_EXPIRES_IN: z.string(), // '7d'
	COOKIE_SECURE: z.coerce.boolean().optional(), // Force secure cookies in production
	COOKIE_SAME_SITE: z.enum(["strict", "lax", "none"]).optional(), // Cookie SameSite policy

	// CORS & URLs
	CORS_ORIGINS: z.string().default("http://localhost:5173"), // Comma-separated allowed origins
	BASE_URL: z.string().default("http://localhost:3000"), // Public base URL

	// Rate limiting
	RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000), // 60 seconds
	RATE_LIMIT_MAX: z.coerce.number().default(100), // Max requests per window
	RATE_LIMIT_AUTH_WINDOW_MS: z.coerce.number().default(60000), // Auth window (stricter)
	RATE_LIMIT_AUTH_MAX: z.coerce.number().default(5), // Auth max requests (stricter)

	// File uploads
	UPLOAD_DIR: z.string().default("uploads"), // Root upload directory
	UPLOAD_MAX_SIZE: z.coerce.number().default(2 * 1024 * 1024), // 2MB max file size

	// Logging
	LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).optional(), // Log verbosity
	LOG_MAX_SIZE: z.coerce.number().optional(), // Max log file size (bytes)
	LOG_MAX_FILES: z.coerce.number().optional(), // Number of rotated log files
	LOG_DIR: z.string().optional(), // Log directory

	// Performance & limits
	BODY_PARSER_LIMIT: z.string().default("10kb"), // Request body size limit
	COMPRESSION_ENABLED: z.coerce.boolean().default(false), // Enable gzip compression

	// Graceful shutdown & cleanup
	SHUTDOWN_TIMEOUT_MS: z.coerce.number().optional(), // Force shutdown timeout
	CLEANUP_INTERVAL_MS: z.coerce.number().optional(), // Upload cleanup interval
});

/**
 * Parses and validates environment variables.
 * Throws a detailed error if validation fails.
 */
export const env = (() => {
	try {
		return EnvSchema.parse(process.env);
	} catch (err) {
		if (err instanceof z.ZodError) {
			// Print all validation issues for easier debugging
			// Use console.error here since logger may not be available during env validation
			// eslint-disable-next-line no-console
			console.error("❌ Invalid environment variables:");
			for (const issue of err.issues) {
				// eslint-disable-next-line no-console
				console.error(`- ${issue.path.join(".")}: ${issue.message}`);
			}
			process.exit(1);
		}
		throw err;
	}
})();
