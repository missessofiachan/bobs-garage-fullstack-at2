// // express app, middleware, routes wiring
import express, { type Application } from 'express';
import path from 'node:path';
import pino from 'pino';
import type { Logger } from 'pino';
import pinoHttp from 'pino-http';
import { applySecurity } from './middleware/security.js';
import routes from './routes/index.js';
import { sequelize } from './config/sequelize.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { env } from './config/env.js';
import { ROOT_UPLOAD_DIR_ABS, UPLOADS_PUBLIC_PATH } from './middleware/upload.js';

// Build Express app (no network listeners here)
export function createApp(providedLogger?: Logger): Application {
	const app = express();

	const pinoOpts: any = env.NODE_ENV === 'development' ? { transport: { target: 'pino-pretty' } } : {};
	const logger = providedLogger ?? pino(pinoOpts);
	const httpLogger = (pinoHttp as any)({ logger });
	app.use(httpLogger);

	// attach the logger to the app instance for handlers to use
	(app as any).log = logger;

	applySecurity(app);
	app.use(express.json({ limit: '10kb' }));

	// Serve uploaded files as static content
	app.use(UPLOADS_PUBLIC_PATH, express.static(ROOT_UPLOAD_DIR_ABS, {
		fallthrough: true,
		setHeaders(res, filePath) {
			// Allow cross-origin embedding of uploaded images (client runs on a different origin in dev)
			// Override helmet's Cross-Origin-Resource-Policy for this route.
			res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
			// Permit any origin to fetch these assets (images are public by definition). This is safe for static images.
			res.setHeader('Access-Control-Allow-Origin', '*');
			// Basic security: no sniffing
			res.setHeader('X-Content-Type-Options', 'nosniff');
			if (path.extname(filePath).match(/\.(png|jpe?g|gif|webp|svg)$/i)) {
				res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
			}
		},
	}));

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

