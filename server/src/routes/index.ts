import { Router } from 'express';
import * as Auth from '../controllers/auth.controller.js';
import { validateBody } from '../middleware/validate.js';
import authSchemas from '../validation/auth.schemas.js';
import * as Staff from '../controllers/staff.controller.js';
import * as Admin from '../controllers/admin.controller.js';
import * as AdminUsers from '../controllers/users.admin.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { staffPhotoUpload } from '../middleware/upload.js';
import servicesRouter from './services.routes.js';
import meRouter from './me.routes.js';

const r: Router = Router();

// Auth
r.post('/auth/register', validateBody(authSchemas.registerSchema), Auth.register);
r.post('/auth/login', validateBody(authSchemas.loginSchema), Auth.login);
r.post('/auth/refresh', Auth.refresh);

// Services mounted router
r.use('/services', servicesRouter);

// Staff
r.get('/staff', Staff.listStaff);
r.get('/staff/:id', Staff.getStaffById);
r.post('/staff', requireAuth, requireAdmin, Staff.createStaff);
r.put('/staff/:id', requireAuth, requireAdmin, Staff.updateStaff);
r.delete('/staff/:id', requireAuth, requireAdmin, Staff.deleteStaff);
// Upload staff photo
r.post('/staff/:id/photo', requireAuth, requireAdmin, staffPhotoUpload.single('photo'), Staff.uploadStaffPhoto);

// Users (me)
r.use('/users/me', meRouter);

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

