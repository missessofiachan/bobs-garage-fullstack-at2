import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import type { Express, Request } from 'express';
import { env } from '../config/env.js';

export function applySecurity(app: Express) {
  // Basic HTTP hardening
  // In development some CSP or strict policies can impede local tooling; tune if needed.
  app.use(helmet());

  // Parse and normalize origins from env (comma-separated)
  const raw = String(env.CORS_ORIGINS ?? '');
  const origins = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (origins.length === 0) {
    // Fallback to localhost dev origin if nothing provided
    // Note: Logger not available here as this runs during app setup
    // In production, this should be configured via env vars
    if (env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn(
        'No CORS_ORIGINS provided; falling back to http://localhost:5173',
      );
    }
    origins.push('http://localhost:5173');
  }

  // Use origin callback to only allow listed origins from browsers, while allowing
  // server-to-server or same-origin requests that have no Origin header.
  const corsOptions = {
    origin: (
      origin: unknown,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow non-browser requests (curl, server-to-server) which don't set Origin
      if (!origin) return callback(null, true);
      if (typeof origin === 'string' && origins.includes(origin))
        return callback(null, true);
      // Not in whitelist: don't set CORS headers (browser will reject)
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    optionsSuccessStatus: 204,
  };

  app.use(cors(corsOptions));

  // Cookie parser: we intentionally don't pass a secret here because refresh tokens
  // are JWTs stored in httpOnly cookies; make sure cookies are marked secure in production
  app.use(cookieParser());

  // Helpful note: downstream middleware can check `req.cookies` and should enforce
  // `secure` and `sameSite` when issuing cookies in production environments.
}
