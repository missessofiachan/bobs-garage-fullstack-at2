/**
 * @author Bob's Garage Team
 * @purpose Admin controller for dashboard metrics and administrative operations
 * @version 1.0.0
 */

import type { Request, Response } from "express";
import * as metricsService from "../services/metrics.service.js";
import { handleControllerError } from "../utils/errors.js";

/**
 * @route GET /api/admin/metrics
 * @description Get comprehensive dashboard metrics for admin overview
 * @access Admin only (requires authentication and admin role)
 * @param {Request} _req - Express request object (not used)
 * @param {Response} res - Express response object
 * @returns {Object} 200 - Metrics object with detailed counts
 * @returns {Object} 401 - Unauthorized (missing or invalid token)
 * @returns {Object} 403 - Forbidden (not admin)
 * @example
 * // Request: GET /api/admin/metrics
 * // Headers: Authorization: Bearer <admin_access_token>
 * // Response:
 * {
 *   "users": { "total": 25, "active": 20, "inactive": 5, "admins": 2, "recent": 3 },
 *   "services": { "total": 10, "published": 8, "unpublished": 2, "recent": 1 },
 *   "staff": { "total": 4, "active": 3, "inactive": 1, "recent": 0 },
 *   "favorites": { "total": 15 },
 *   "recentActivity": { "usersToday": 1, "servicesToday": 0, "staffToday": 0 }
 * }
 */
export async function getMetrics(_req: Request, res: Response) {
	try {
		const metrics = await metricsService.getDashboardMetrics();
		res.json(metrics);
	} catch (err) {
		handleControllerError(err, res);
	}
}
