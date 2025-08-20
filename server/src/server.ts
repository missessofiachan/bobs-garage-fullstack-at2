//// startup (reads env, connect DB, listen)
import pino from 'pino';
import type { Server } from 'http';
import { env } from './config/env.js';
import { sequelize } from './config/sequelize.js';
import { createApp } from './app.js';
import cleanupService from './services/cleanup.service.js';

const logger = pino(env.NODE_ENV === 'development' ? { transport: { target: 'pino-pretty' } } : {});

// Ensure PORT is a number when read from env
const PORT = Number(env.PORT);
if (!Number.isFinite(PORT) || PORT <= 0) {
  logger.error({ port: env.PORT }, 'Invalid PORT; must be a positive number');
  process.exit(1);
}

let server: Server | undefined;
let isShuttingDown = false;

async function start() {
  logger.info({ env: env.NODE_ENV, pid: process.pid }, 'Starting application');

  try {
    await sequelize.authenticate();
    logger.info('Database connection OK');

    if (env.NODE_ENV === 'development') {
      logger.info('Running sequelize.sync() (development only)');
      await sequelize.sync();
    }

    const app = createApp(logger);

    server = app.listen(PORT, () => {
      const addr = server?.address();
      const host = typeof addr === 'object' && addr ? addr.address : 'localhost';
      const port = typeof addr === 'object' && addr ? addr.port : PORT;
      logger.info({ host, port }, `API listening`);
      // start background cleanup job
      try {
        cleanupService.startCleanup();
        logger.info('Started uploads cleanup job');
      } catch (err) {
        logger.warn({ err }, 'Failed to start cleanup job');
      }
    });

    server.on('error', (err: NodeJS.ErrnoException) => {
      logger.error({ err }, 'Server error');
      if (!isShuttingDown) {
        setTimeout(() => process.exit(1), 100);
      }
    });
  } catch (err) {
    logger.error({ err }, 'Failed to start application');
    setTimeout(() => process.exit(1), 100);
  }
}

start();

async function shutdown(signal?: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info({ signal }, 'Shutting down');

  // Force exit if shutdown hangs
  const forceTimeout = Number(env.SHUTDOWN_TIMEOUT_MS) || 10000;
  const forceKill = setTimeout(() => {
    logger.warn('Forcing shutdown after timeout');
    process.exit(1);
  }, forceTimeout);

  try {
    if (server && typeof server.close === 'function') {
      await new Promise<void>((resolve, reject) => {
        server!.close((err?: Error) => (err ? reject(err) : resolve()));
      });
    }

    await sequelize.close();
  // stop cleanup job when shutting down
  try { cleanupService.stopCleanup(); } catch {}
    clearTimeout(forceKill);
    logger.info('Shutdown complete');
    process.exit(0);
  } catch (err) {
    clearTimeout(forceKill);
    logger.error({ err }, 'Error during shutdown');
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
  logger.fatal({ err }, 'uncaughtException');
  // attempt graceful shutdown, then exit
  shutdown('uncaughtException').catch(() => setTimeout(() => process.exit(1), 100));
});

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'unhandledRejection');
  shutdown('unhandledRejection').catch(() => setTimeout(() => process.exit(1), 100));
});
