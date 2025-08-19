import express, { type Application } from 'express';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { applySecurity } from './middleware/security.js';
import routes from './routes/index.js';
import { sequelize } from './config/sequelize.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { env } from './config/env.js';

// Build Express app (no network listeners here)
export function createApp(): Application {
	const app = express();

	const pinoOpts: any = env.NODE_ENV === 'development' ? { transport: { target: 'pino-pretty' } } : {};
	const logger = pino(pinoOpts);
	const httpLogger = (pinoHttp as any)({ logger });
	app.use(httpLogger);

	applySecurity(app);
	app.use(express.json({ limit: '10kb' }));

	// Rate limit all API routes
	app.use('/api', apiLimiter, routes);

	app.get('/db-status', async (_req, res) => {
		try {
			await sequelize.authenticate();
			res.status(200).json({ status: 'connected' });
		} catch (err) {
			res.status(500).json({ status: 'disconnected', error: (err as Error).message });
		}
	});

	// health check
	app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

	// 404 handler
	app.use((_req, res) => res.status(404).json({ message: 'Not Found' }));

	// Global error handler
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
		(app as any).log?.error?.({ err }, 'Unhandled error in request pipeline');
		res.status(500).json({ message: 'Internal server error' });
	});

	return app;
}

export const app: Application = createApp();

