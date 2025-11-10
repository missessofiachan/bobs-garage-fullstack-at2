/**
 * @author Bob's Garage Team
 * @purpose Winston logger configuration with file transports for API logging
 * @version 1.0.0
 */

import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import winston from 'winston';
import { env } from './env.js';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), env.LOG_DIR ?? 'logs');

if (!existsSync(logsDir)) {
  mkdirSync(logsDir, { recursive: true });
}

/**
 * Create Winston logger with file transports
 * Separate logs for combined (all levels), errors, and API requests
 */
export const winstonLogger = winston.createLogger({
  level: env.LOG_LEVEL ?? (env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'bobs-garage-api' },
  transports: [
    // Log all messages to combined.log
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: env.LOG_MAX_SIZE ?? 10 * 1024 * 1024, // Default 10MB
      maxFiles: env.LOG_MAX_FILES ?? 5,
    }),
    // Log only errors to error.log
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: env.LOG_MAX_SIZE ?? 10 * 1024 * 1024, // Default 10MB
      maxFiles: env.LOG_MAX_FILES ?? 5,
    }),
    // If not in production, also log to console with color formatting
    ...(env.NODE_ENV !== 'production'
      ? [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.printf(({ level, message, timestamp, ...meta }) => {
                let msg = `${timestamp} [${level}]: ${message}`;
                if (Object.keys(meta).length > 0) {
                  msg += ` ${JSON.stringify(meta)}`;
                }
                return msg;
              })
            ),
          }),
        ]
      : []),
  ],
});

// Create separate logger for API requests only
export const apiLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
  ),
  defaultMeta: { service: 'api-requests' },
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'api-requests.log'),
      maxsize: env.LOG_MAX_SIZE ?? 10 * 1024 * 1024, // Default 10MB
      maxFiles: env.LOG_MAX_FILES ?? 7,
    }),
  ],
});
