// Environment variable loader and validator
import { config as dotenvConfig } from 'dotenv';
import { z } from 'zod';

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
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'), // 'development'
  PORT: z.coerce.number().default(4000), // 4000
  DATABASE_HOST: z.string(), // 'localhost'
  DATABASE_PORT: z.coerce.number(), // 3306
  DATABASE_NAME: z.string(), // 'bobs_garage'
  DATABASE_USER: z.string(), // 'root'
  DATABASE_PASSWORD: z.string(), // 'password'
  JWT_SECRET: z.string().min(32), // 'supersecretjwtkeywith32charsmin'
  JWT_EXPIRES_IN: z.string(), // '1h'
  REFRESH_EXPIRES_IN: z.string(), // '7d'
  // Comma-separated list of allowed CORS origins. Defaults to localhost dev origin.
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  // Shutdown timeout in milliseconds when graceful shutdown should be forced.
  SHUTDOWN_TIMEOUT_MS: z.coerce.number().optional(), // 10000
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
      console.error('❌ Invalid environment variables:');
      for (const issue of err.issues) {
        console.error(`- ${issue.path.join('.')}: ${issue.message}`);
      }
      process.exit(1);
    }
    throw err;
  }
})();
