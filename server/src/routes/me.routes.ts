import { Router, type Router as RouterType } from 'express';
import * as User from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import staffSchemas from '../validation/staff.schemas.js';

const r: RouterType = Router();

r.get('/', requireAuth, User.getMyProfile);
// For updating profile we accept a subset similar to staff update (email, active)
r.put(
  '/',
  requireAuth,
  validateBody(staffSchemas.staffUpdateSchema),
  User.updateProfile,
);

export default r;
