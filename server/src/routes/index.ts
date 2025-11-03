import { Router } from 'express';
import * as Auth from '../controllers/auth.controller.js';
import { validateBody } from '../middleware/validate.js';
import authSchemas from '../validation/auth.schemas.js';
import * as Staff from '../controllers/staff.controller.js';
import * as Admin from '../controllers/admin.controller.js';
import * as AdminUsers from '../controllers/users.admin.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import servicesRouter from './services.routes.js';
import staffRouter from './staff.routes.js';
import meRouter from './me.routes.js';
import favoritesRouter from './favorites.routes.js';

const r: Router = Router();

// Auth (with stricter rate limiting)
r.post(
  '/auth/register',
  authLimiter,
  validateBody(authSchemas.registerSchema),
  Auth.register,
);
r.post('/auth/login', authLimiter, validateBody(authSchemas.loginSchema), Auth.login);
r.post('/auth/refresh', authLimiter, Auth.refresh);

// Services mounted router
r.use('/services', servicesRouter);

// Staff
r.use('/staff', staffRouter);

// Users (me)
r.use('/users/me', meRouter);

// Favorites
r.use('/users/me/favorites', favoritesRouter);

// Admin
r.get('/admin/metrics', requireAuth, requireAdmin, Admin.getMetrics);
r.get('/admin/users', requireAuth, requireAdmin, AdminUsers.listUsers);
r.get('/admin/users/:id', requireAuth, requireAdmin, AdminUsers.getUserById);
r.post('/admin/users', requireAuth, requireAdmin, AdminUsers.createUser);
r.put('/admin/users/:id', requireAuth, requireAdmin, AdminUsers.updateUser);
r.delete('/admin/users/:id', requireAuth, requireAdmin, AdminUsers.deleteUser);

// Health
r.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

export default r;
