import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
	windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000),
	max: Number(process.env.RATE_LIMIT_MAX ?? 100),
	standardHeaders: true,
	legacyHeaders: false,
});
