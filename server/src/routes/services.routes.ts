/**
 * @author Bob's Garage Team
 * @purpose Service routes for CRUD operations and image uploads
 * @version 1.0.0
 */

import { Router, type Router as RouterType } from 'express';
import * as Svc from '../controllers/service.controller.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { cacheMiddleware } from '../middleware/cache.js';
import { serviceImageUpload, validateFileContent } from '../middleware/upload.js';
import { validateBody } from '../middleware/validate.js';
import servicesSchemas from '../validation/services.schemas.js';

const r: RouterType = Router();

// Cache GET requests with different TTLs
r.get('/', cacheMiddleware(300, 'services'), Svc.listServices); // 5 minutes for list
r.get('/:id', cacheMiddleware(600, 'services'), Svc.getServiceById); // 10 minutes for single item
r.post(
  '/',
  requireAuth,
  requireAdmin,
  validateBody(servicesSchemas.serviceCreateSchema),
  Svc.createService
);
r.put(
  '/:id',
  requireAuth,
  requireAdmin,
  validateBody(servicesSchemas.serviceUpdateSchema),
  Svc.updateService
);
r.delete('/:id', requireAuth, requireAdmin, Svc.deleteService);
r.post(
  '/:id/image',
  requireAuth,
  requireAdmin,
  serviceImageUpload.single('image'),
  validateFileContent,
  Svc.uploadServiceImage
);

export default r;
