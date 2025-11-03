//// startup (reads env, connect DB, listen)
import 'reflect-metadata';
import type { Server } from 'http';
import { env } from './config/env.js';
import { sequelize } from './config/sequelize.js';
import { createApp } from './app.js';
import cleanupService from './services/cleanup.service.js';
import { winstonLogger } from './config/winston.js';

// Ensure PORT is a number when read from env
const PORT = Number(env.PORT);
if (!Number.isFinite(PORT) || PORT <= 0) {
  winstonLogger.error(`Invalid PORT ${env.PORT}; must be a positive number`);
  process.exit(1);
}

let server: Server | undefined;
let isShuttingDown = false;

async function start() {
  winstonLogger.info(`Starting application [${env.NODE_ENV}] (PID: ${process.pid})`);

  try {
    await sequelize.authenticate();
    winstonLogger.info('Database connection OK');

    if (env.NODE_ENV === 'development') {
      winstonLogger.info('Running sequelize.sync() (development only)');
      await sequelize.sync();
    }

    const app = createApp();

    server = app.listen(PORT, () => {
      const addr = server?.address();
      const host =
        typeof addr === 'object' && addr ? addr.address : 'localhost';
      const port = typeof addr === 'object' && addr ? addr.port : PORT;
      winstonLogger.info(`API listening on ${host}:${port}`);
      // start background cleanup job
      try {
        cleanupService.startCleanup();
        winstonLogger.info('Started uploads cleanup job');
      } catch (err) {
        winstonLogger.warn(`Failed to start cleanup job: ${err}`);
      }
    });

    server.on('error', (err: NodeJS.ErrnoException) => {
      winstonLogger.error(`Server error: ${err.message}`);
      if (!isShuttingDown) {
        setTimeout(() => process.exit(1), 100);
      }
    });
  } catch (err) {
    winstonLogger.error(`Failed to start application: ${err}`);
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
  shutdown('uncaughtException').catch(() =>
    setTimeout(() => process.exit(1), 100),
  );
});

process.on('unhandledRejection', (reason) => {
  winstonLogger.error(`Unhandled rejection: ${reason}`);
  shutdown('unhandledRejection').catch(() =>
    setTimeout(() => process.exit(1), 100),
  );
});
