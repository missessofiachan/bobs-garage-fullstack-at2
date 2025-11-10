/**
 * @author Bob's Garage Team
 * @purpose Staff routes for CRUD operations and photo uploads
 * @version 1.0.0
 */

import { Router, type Router as RouterType } from 'express';
import * as Svc from '../controllers/staff.controller.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { cacheMiddleware } from '../middleware/cache.js';
import { staffPhotoUpload, validateFileContent } from '../middleware/upload.js';
import { validateBody } from '../middleware/validate.js';
import staffSchemas from '../validation/staff.schemas.js';

const r: RouterType = Router();

// Cache GET requests
r.get('/', cacheMiddleware(300, 'staff'), Svc.listStaff); // 5 minutes for list
r.get('/:id', cacheMiddleware(600, 'staff'), Svc.getStaffById); // 10 minutes for single item
r.post(
  '/',
  requireAuth,
  requireAdmin,
  validateBody(staffSchemas.staffCreateSchema),
  Svc.createStaff
);
r.put(
  '/:id',
  requireAuth,
  requireAdmin,
  validateBody(staffSchemas.staffUpdateSchema),
  Svc.updateStaff
);
r.delete('/:id', requireAuth, requireAdmin, Svc.deleteStaff);
r.post(
  '/:id/image',
  requireAuth,
  requireAdmin,
  staffPhotoUpload.single('photo'),
  validateFileContent,
  Svc.uploadStaffPhoto
);

export default r;
