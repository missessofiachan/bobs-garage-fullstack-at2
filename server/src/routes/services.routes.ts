import { Router, type Router as RouterType } from 'express';
import * as Svc from '../controllers/service.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import servicesSchemas from '../validation/services.schemas.js';
import { serviceImageUpload } from '../middleware/upload.js';

const r: RouterType = Router();

r.get('/', Svc.listServices);
r.get('/:id', Svc.getServiceById);
r.post('/', requireAuth, requireAdmin, validateBody(servicesSchemas.serviceCreateSchema), Svc.createService);
r.put('/:id', requireAuth, requireAdmin, validateBody(servicesSchemas.serviceUpdateSchema), Svc.updateService);
r.delete('/:id', requireAuth, requireAdmin, Svc.deleteService);
r.post('/:id/image', requireAuth, requireAdmin, serviceImageUpload.single('image'), Svc.uploadServiceImage);

export default r;
