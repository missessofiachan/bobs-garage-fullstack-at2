import { Router } from 'express';
import * as Auth from '../controllers/auth.controller.js';
import * as Svc from '../controllers/service.controller.js';
import * as Staff from '../controllers/staff.controller.js';
import * as User from '../controllers/user.controller.js';
import * as Admin from '../controllers/admin.controller.js';
import * as AdminUsers from '../controllers/users.admin.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const r: Router = Router();

// Auth
r.post('/auth/register', Auth.register);
r.post('/auth/login', Auth.login);
r.post('/auth/refresh', Auth.refresh);

// Services
r.get('/services', Svc.listServices);
r.get('/services/:id', Svc.getServiceById);
r.post('/services', requireAuth, requireAdmin, Svc.createService);
r.put('/services/:id', requireAuth, requireAdmin, Svc.updateService);
r.delete('/services/:id', requireAuth, requireAdmin, Svc.deleteService);

// Staff
r.get('/staff', Staff.listStaff);
r.get('/staff/:id', Staff.getStaffById);
r.post('/staff', requireAuth, requireAdmin, Staff.createStaff);
r.put('/staff/:id', requireAuth, requireAdmin, Staff.updateStaff);
r.delete('/staff/:id', requireAuth, requireAdmin, Staff.deleteStaff);

// Users
r.get('/users/me', requireAuth, User.getMyProfile);
r.put('/users/me', requireAuth, User.updateProfile);

// Admin
r.get('/admin/metrics', requireAuth, requireAdmin, Admin.getMetrics);
r.get('/admin/users', requireAuth, requireAdmin, AdminUsers.listUsers);
r.get('/admin/users/:id', requireAuth, requireAdmin, AdminUsers.getUserById);
r.post('/admin/users', requireAuth, requireAdmin, AdminUsers.createUser);
r.put('/admin/users/:id', requireAuth, requireAdmin, AdminUsers.updateUser);
r.delete('/admin/users/:id', requireAuth, requireAdmin, AdminUsers.deleteUser);

// Health
r.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

export default r;

