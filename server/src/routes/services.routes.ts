/**
 * @author Bob's Garage Team
 * @purpose Service routes for CRUD operations and image uploads
 * @version 1.0.0
 */

import { Router, type Router as RouterType } from "express";
import * as Svc from "../controllers/service.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { serviceImageUpload } from "../middleware/upload.js";
import { validateBody } from "../middleware/validate.js";
import servicesSchemas from "../validation/services.schemas.js";

const r: RouterType = Router();

r.get("/", Svc.listServices);
r.get("/:id", Svc.getServiceById);
r.post(
	"/",
	requireAuth,
	requireAdmin,
	validateBody(servicesSchemas.serviceCreateSchema),
	Svc.createService,
);
r.put(
	"/:id",
	requireAuth,
	requireAdmin,
	validateBody(servicesSchemas.serviceUpdateSchema),
	Svc.updateService,
);
r.delete("/:id", requireAuth, requireAdmin, Svc.deleteService);
r.post(
	"/:id/image",
	requireAuth,
	requireAdmin,
	serviceImageUpload.single("image"),
	Svc.uploadServiceImage,
);

export default r;
