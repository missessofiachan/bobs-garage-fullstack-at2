import { Router, type Router as RouterType } from 'express';
import * as Svc from '../controllers/staff.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import servicesSchemas from '../validation/services.schemas.js';
import { staffPhotoUpload } from '../middleware/upload.js';

const r: RouterType = Router();

r.get('/', Svc.listStaff);
r.get('/:id', Svc.getStaffById);
r.post(
  '/',
  requireAuth,
  requireAdmin,
  validateBody(servicesSchemas.serviceCreateSchema),
  Svc.createStaff,
);
r.put(
  '/:id',
  requireAuth,
  requireAdmin,
  validateBody(servicesSchemas.serviceUpdateSchema),
  Svc.updateStaff,
);
r.delete('/:id', requireAuth, requireAdmin, Svc.deleteStaff);
r.post(
  '/:id/image',
  requireAuth,
  requireAdmin,
  staffPhotoUpload.single('photo'),
  Svc.uploadStaffPhoto,
);

export default r;
