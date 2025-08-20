import pino from 'pino';
import type { Logger } from 'pino';
import { env } from '../config/env.js';

export function createLogger(name?: string): Logger {
	const opts: any = env.NODE_ENV === 'development' ? { transport: { target: 'pino-pretty' } } : {};
	const logger = pino(opts).child({ service: name ?? 'api' });
	return logger;
}

// Convenience default logger
export const logger = createLogger();

export default logger;


