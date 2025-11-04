/**
 * @author Bob's Garage Team
 * @purpose Admin controller for dashboard metrics and administrative operations
 * @version 1.0.0
 */

import type { Request, Response } from "express";
import { Op } from "sequelize";
import { Favorite } from "../db/models/Favorite.js";
import { Service } from "../db/models/Service.js";
import { Staff } from "../db/models/Staff.js";
import { User } from "../db/models/User.js";
import { handleControllerError } from "../utils/errors.js";

interface MetricsResponse {
	users: {
		total: number;
		active: number;
		inactive: number;
		admins: number;
		recent: number; // Users created in last 7 days
	};
	services: {
		total: number;
		published: number;
		unpublished: number;
		recent: number; // Services created in last 7 days
	};
	staff: {
		total: number;
		active: number;
		inactive: number;
		recent: number; // Staff created in last 7 days
	};
	favorites: {
		total: number;
	};
	recentActivity: {
		usersToday: number;
		servicesToday: number;
		staffToday: number;
	};
}

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
		const now = new Date();
		const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

		const [
			usersTotal,
			usersActive,
			usersInactive,
			usersAdmins,
			usersRecent,
			usersToday,
			servicesTotal,
			servicesPublished,
			servicesUnpublished,
			servicesRecent,
			servicesToday,
			staffTotal,
			staffActive,
			staffInactive,
			staffRecent,
			staffToday,
			favoritesTotal,
		] = await Promise.all([
			// Users
			User.count(),
			User.count({ where: { active: true } }),
			User.count({ where: { active: false } }),
			User.count({ where: { role: "admin" } }),
			User.count({ where: { createdAt: { [Op.gte]: sevenDaysAgo } } }),
			User.count({ where: { createdAt: { [Op.gte]: today } } }),
			// Services
			Service.count(),
			Service.count({ where: { published: true } }),
			Service.count({ where: { published: false } }),
			Service.count({ where: { createdAt: { [Op.gte]: sevenDaysAgo } } }),
			Service.count({ where: { createdAt: { [Op.gte]: today } } }),
			// Staff
			Staff.count(),
			Staff.count({ where: { active: true } }),
			Staff.count({ where: { active: false } }),
			Staff.count({ where: { createdAt: { [Op.gte]: sevenDaysAgo } } }),
			Staff.count({ where: { createdAt: { [Op.gte]: today } } }),
			// Favorites
			Favorite.count(),
		]);

		const metrics: MetricsResponse = {
			users: {
				total: usersTotal,
				active: usersActive,
				inactive: usersInactive,
				admins: usersAdmins,
				recent: usersRecent,
			},
			services: {
				total: servicesTotal,
				published: servicesPublished,
				unpublished: servicesUnpublished,
				recent: servicesRecent,
			},
			staff: {
				total: staffTotal,
				active: staffActive,
				inactive: staffInactive,
				recent: staffRecent,
			},
			favorites: {
				total: favoritesTotal,
			},
			recentActivity: {
				usersToday: usersToday,
				servicesToday: servicesToday,
				staffToday: staffToday,
			},
		};

		res.json(metrics);
	} catch (err) {
		handleControllerError(err, res);
	}
}
