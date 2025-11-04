/**
 * @author Bob's Garage Team
 * @purpose Staff routes for CRUD operations and photo uploads
 * @version 1.0.0
 */

import { Router, type Router as RouterType } from "express";
import * as Svc from "../controllers/staff.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { staffPhotoUpload } from "../middleware/upload.js";
import { validateBody } from "../middleware/validate.js";
import staffSchemas from "../validation/staff.schemas.js";

const r: RouterType = Router();

r.get("/", Svc.listStaff);
r.get("/:id", Svc.getStaffById);
r.post(
	"/",
	requireAuth,
	requireAdmin,
	validateBody(staffSchemas.staffCreateSchema),
	Svc.createStaff,
);
r.put(
	"/:id",
	requireAuth,
	requireAdmin,
	validateBody(staffSchemas.staffUpdateSchema),
	Svc.updateStaff,
);
r.delete("/:id", requireAuth, requireAdmin, Svc.deleteStaff);
r.post(
	"/:id/image",
	requireAuth,
	requireAdmin,
	staffPhotoUpload.single("photo"),
	Svc.uploadStaffPhoto,
);

export default r;
