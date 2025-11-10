/**
 * @author Bob's Garage Team
 * @purpose Server startup script that initializes database connection and starts Express app
 * @version 1.0.0
 */

import 'reflect-metadata';
import type { Server } from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { sequelize } from './config/sequelize.js';
import { winstonLogger } from './config/winston.js';
import cacheService from './services/cache.service.js';
import cleanupService from './services/cleanup.service.js';

// Validate and normalize PORT configuration
const PORT = Number(env.PORT);
if (!Number.isFinite(PORT) || PORT <= 0) {
  winstonLogger.error(`Invalid PORT ${env.PORT}; must be a positive number`);
  process.exit(1);
}

let server: Server | undefined;
let isShuttingDown = false;

/**
 * Initialize cache service and verify connection (for Redis backends)
 */
async function initializeCache(): Promise<void> {
  if (!cacheService.isEnabled()) {
    winstonLogger.info('Cache service disabled');
    return;
  }

  try {
    // For Redis backends, verify connection is ready
    // The cache service auto-initializes, but we verify it's working
    if (env.CACHE_TYPE === 'redis' && env.REDIS_HOST) {
      // Test cache connection with a simple operation
      await cacheService.set('__health_check__', 'ok', 1);
      await cacheService.del('__health_check__');
      winstonLogger.info('Cache service initialized and verified');
    } else {
      winstonLogger.info('Cache service initialized (in-memory)');
    }
  } catch (err) {
    winstonLogger.warn(
      `Cache service initialization warning: ${err instanceof Error ? err.message : String(err)}. Continuing without cache.`
    );
  }
}

/**
 * Handle port conflict errors with helpful messages
 */
function handlePortError(err: NodeJS.ErrnoException): void {
  if (err.code === 'EADDRINUSE') {
    winstonLogger.error(
      `Port ${PORT} is already in use. Please either:\n` +
        `  1. Stop the process using port ${PORT}\n` +
        `  2. Use a different port by setting PORT environment variable\n` +
        `  3. On Windows, find the process: netstat -ano | findstr :${PORT}\n` +
        `  4. On Unix/Mac, find the process: lsof -i :${PORT}`
    );
  } else {
    winstonLogger.error(`Server error: ${err.message}`, err);
  }

  if (!isShuttingDown) {
    setTimeout(() => process.exit(1), 100);
  }
}

async function start() {
  winstonLogger.info(`Starting application [${env.NODE_ENV}] (PID: ${process.pid})`);

  try {
    // Initialize database connection
    await sequelize.authenticate();
    winstonLogger.info('Database connection OK');

    // Initialize cache service before app creation
    await initializeCache();

    // Sync database schema in development
    if (env.NODE_ENV === 'development') {
      winstonLogger.info('Running sequelize.sync() (development only)');
      await sequelize.sync();
    }

    // Create and configure Express app
    const app = createApp();

    // Start HTTP server with improved error handling
    server = app.listen(PORT, async () => {
      const addr = server?.address();
      const host = typeof addr === 'object' && addr ? addr.address : 'localhost';
      const port = typeof addr === 'object' && addr ? addr.port : PORT;
      winstonLogger.info(`API listening on ${host}:${port}`);

      // Run initial cleanup of orphaned pictures on startup
      try {
        await cleanupService.runCleanupOnce();
        winstonLogger.info('Completed initial orphaned pictures cleanup');
      } catch (err) {
        winstonLogger.warn(`Failed to run initial cleanup: ${err}`);
      }

      // Start background cleanup job after server is ready
      try {
        cleanupService.startCleanup();
        winstonLogger.info('Started uploads cleanup job');
      } catch (err) {
        winstonLogger.warn(`Failed to start cleanup job: ${err}`);
      }
    });

    // Enhanced error handling for server events
    server.on('error', handlePortError);
  } catch (err) {
    winstonLogger.error(
      `Failed to start application: ${err instanceof Error ? err.message : String(err)}`,
      err
    );
    setTimeout(() => process.exit(1), 100);
  }
}

start();

async function shutdown(signal?: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  winstonLogger.info(`Shutting down due to signal: ${signal}`);

  // Force exit if shutdown hangs
  const forceTimeout = Number(env.SHUTDOWN_TIMEOUT_MS) || 10000;
  const forceKill = setTimeout(() => {
    winstonLogger.warn('Forcing shutdown after timeout');
    process.exit(1);
  }, forceTimeout);

  try {
    if (server && typeof server.close === 'function') {
      await new Promise<void>((resolve, reject) => {
        server!.close((err?: Error) => (err ? reject(err) : resolve()));
      });
    }

    await sequelize.close();

    // Disconnect cache service
    try {
      await cacheService.disconnect();
    } catch {}

    // stop cleanup job when shutting down
    try {
      cleanupService.stopCleanup();
    } catch {}
    clearTimeout(forceKill);
    winstonLogger.info('Shutdown complete');
    process.exit(0);
  } catch (err) {
    clearTimeout(forceKill);
    winstonLogger.error(`Error during shutdown: ${err}`);
    process.exit(1);
  }
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

// nodemon and similar use SIGUSR2 for restart — forward it after graceful shutdown
process.on('SIGUSR2', () => {
  shutdown('SIGUSR2').then(() => process.kill(process.pid, 'SIGUSR2'));
});

process.on('uncaughtException', (err) => {
  winstonLogger.error(`Uncaught exception: ${err.message}`, err);
  // attempt graceful shutdown, then exit
  shutdown('uncaughtException').catch(() => setTimeout(() => process.exit(1), 100));
});

process.on('unhandledRejection', (reason) => {
  winstonLogger.error(`Unhandled rejection: ${reason}`);
  shutdown('unhandledRejection').catch(() => setTimeout(() => process.exit(1), 100));
});
