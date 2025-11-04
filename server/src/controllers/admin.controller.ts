/**
 * @author Bob's Garage Team
 * @purpose Admin controller for dashboard metrics and administrative operations
 * @version 1.0.0
 */

import type { Request, Response } from "express";
import { Service } from "../db/models/Service.js";
import { Staff } from "../db/models/Staff.js";
import { User } from "../db/models/User.js";
import { handleControllerError } from "../utils/errors.js";

/**
 * @route GET /api/admin/metrics
 * @description Get dashboard metrics for admin overview (total counts of users, services, and staff)
 * @access Admin only (requires authentication and admin role)
 * @param {Request} _req - Express request object (not used)
 * @param {Response} res - Express response object
 * @returns {Object} 200 - Metrics object with counts
 * @returns {Object} 401 - Unauthorized (missing or invalid token)
 * @returns {Object} 403 - Forbidden (not admin)
 * @example
 * // Request: GET /api/admin/metrics
 * // Headers: Authorization: Bearer <admin_access_token>
 * // Response:
 * {
 *   "users": 25,
 *   "services": 10,
 *   "staff": 4
 * }
 */
export async function getMetrics(_req: Request, res: Response) {
	try {
		const [users, services, staff] = await Promise.all([
			User.count(),
			Service.count(),
			Staff.count(),
		]);
		res.json({ users, services, staff });
	} catch (err) {
		handleControllerError(err, res);
	}
}
