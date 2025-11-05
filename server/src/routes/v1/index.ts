/**
 * @author Bob's Garage Team
 * @purpose API v1 router - all routes under /api/v1/
 * @version 1.0.0
 */

import { Router } from "express";
import * as Admin from "../../controllers/admin.controller.js";
import * as Audit from "../../controllers/audit.controller.js";
import * as Auth from "../../controllers/auth.controller.js";
import * as Staff from "../../controllers/staff.controller.js";
import * as AdminUsers from "../../controllers/users.admin.controller.js";
import { requireAdmin, requireAuth } from "../../middleware/auth.js";
import { cacheMiddleware } from "../../middleware/cache.js";
import { authLimiter } from "../../middleware/rateLimit.js";
import { validateBody } from "../../middleware/validate.js";
import authSchemas from "../../validation/auth.schemas.js";
import favoritesRouter from "../favorites.routes.js";
import meRouter from "../me.routes.js";
import servicesRouter from "../services.routes.js";
import staffRouter from "../staff.routes.js";

const r: Router = Router();

// Auth (with stricter rate limiting)
r.post("/auth/register", authLimiter, validateBody(authSchemas.registerSchema), Auth.register);
r.post("/auth/login", authLimiter, validateBody(authSchemas.loginSchema), Auth.login);
r.post("/auth/refresh", authLimiter, Auth.refresh);
r.post("/auth/logout", Auth.logout);

// Services mounted router
r.use("/services", servicesRouter);

// Staff
r.use("/staff", staffRouter);

// Users (me)
r.use("/users/me", meRouter);

// Favorites
r.use("/users/me/favorites", favoritesRouter);

// Admin (with caching for metrics)
r.get("/admin/metrics", requireAuth, requireAdmin, cacheMiddleware(60, "admin"), Admin.getMetrics);
r.get("/admin/audit-logs", requireAuth, requireAdmin, Audit.getAuditLogs);
r.get("/admin/users", requireAuth, requireAdmin, AdminUsers.listUsers);
r.get("/admin/users/:id", requireAuth, requireAdmin, AdminUsers.getUserById);
r.post("/admin/users", requireAuth, requireAdmin, AdminUsers.createUser);
r.put("/admin/users/:id", requireAuth, requireAdmin, AdminUsers.updateUser);
r.delete("/admin/users/:id", requireAuth, requireAdmin, AdminUsers.deleteUser);

// Health check endpoint (for frontend connection status)
r.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

export default r;
