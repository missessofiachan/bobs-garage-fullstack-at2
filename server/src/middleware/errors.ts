import type { Request, Response, NextFunction } from 'express';

export function notFound(_req: Request, res: Response) {
	return res.status(404).json({ message: 'Not Found' });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
	// don't leak internals in prod
	return res.status(500).json({ message: 'Internal server error' });
}

