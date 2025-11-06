/**
 * @author Bob's Garage Team
 * @purpose Favorites controller for managing user-service favorites
 * @version 1.0.0
 */

import type { Request, Response } from "express";
import { Favorite } from "../db/models/Favorite.js";
import { Service } from "../db/models/Service.js";
import { sendConflictError, sendNotFoundError } from "../utils/errorResponse.js";
import { handleControllerError } from "../utils/errors.js";
import { requireAuth } from "../utils/validation.js";

/**
 * @route GET /api/users/me/favorites
 * @description List all favorite services for the authenticated user
 * @access Authenticated users only (requires valid JWT token)
 * @param {Request} req - Express request object (must include valid JWT in Authorization header)
 * @param {Response} res - Express response object
 * @returns {Array} 200 - Array of service objects that are favorited by the user
 * @returns {Object} 401 - Unauthorized (missing or invalid token)
 * @example
 * // Request: GET /api/users/me/favorites
 * // Headers: Authorization: Bearer <access_token>
 * // Response:
 * [
 *   {
 *     "id": 1,
 *     "name": "Oil Change",
 *     "price": 75.00,
 *     "description": "Full synthetic oil change",
 *     "imageUrl": "http://localhost:4000/uploads/services/image.jpg"
 *   }
 * ]
 */
export async function listFavorites(req: Request, res: Response) {
	try {
		const userId = requireAuth(req, res);
		if (!userId) return; // Error response already sent

		const favorites = await Favorite.findAll({
			where: { userId },
			include: [
				{
					model: Service,
					attributes: ["id", "name", "price", "description", "imageUrl"],
				},
			],
			order: [["createdAt", "DESC"]],
		});

		// Return just the service data for easier frontend consumption
		const services = favorites.map((fav) => fav.service);
		res.json(services);
	} catch (err) {
		handleControllerError(err, res);
	}
}

/**
 * @route POST /api/users/me/favorites/:serviceId
 * @description Add a service to the authenticated user's favorites
 * @access Authenticated users only (requires valid JWT token)
 * @param {Request} req - Express request object
 * @param {Request.params.serviceId} req.params.serviceId - Service ID to add to favorites (required)
 * @param {Response} res - Express response object
 * @returns {Object} 201 - Success message with favorite relationship created
 * @returns {Object} 400 - Invalid service ID format
 * @returns {Object} 401 - Unauthorized (missing or invalid token)
 * @returns {Object} 404 - Service not found
 * @returns {Object} 409 - Service already in favorites (conflict)
 * @example
 * // Request: POST /api/users/me/favorites/1
 * // Headers: Authorization: Bearer <access_token>
 * // Response (201):
 * {
 *   "message": "Service added to favorites",
 *   "userId": 1,
 *   "serviceId": 1
 * }
 */
export async function addFavorite(req: Request, res: Response) {
	try {
		const userId = requireAuth(req, res);
		if (!userId) return; // Error response already sent

		const serviceId = Number(req.params.serviceId);
		if (!Number.isFinite(serviceId)) {
			return res.status(400).json({ message: "Invalid service ID" });
		}

		// Verify service exists
		const service = await Service.findByPk(serviceId);
		if (!service) {
			return sendNotFoundError(res, "Service not found");
		}

		// Check if already favorited
		const existing = await Favorite.findOne({
			where: { userId, serviceId },
		});

		if (existing) {
			return sendConflictError(res, "Service already in favorites");
		}

		// Create favorite
		const favorite = await Favorite.create({ userId, serviceId });
		res.status(201).json({
			id: favorite.id,
			serviceId: favorite.serviceId,
			createdAt: favorite.createdAt,
		});
	} catch (err) {
		handleControllerError(err, res);
	}
}

/**
 * Remove a service from user's favorites
 */
/**
 * @route DELETE /api/users/me/favorites/:serviceId
 * @description Remove a service from the authenticated user's favorites
 * @access Authenticated users only (requires valid JWT token)
 * @param {Request} req - Express request object
 * @param {Request.params.serviceId} req.params.serviceId - Service ID to remove from favorites (required)
 * @param {Response} res - Express response object
 * @returns {void} 204 - Favorite removed successfully
 * @returns {Object} 400 - Invalid service ID format
 * @returns {Object} 401 - Unauthorized (missing or invalid token)
 * @returns {Object} 404 - Favorite not found
 * @example
 * // Request: DELETE /api/users/me/favorites/1
 * // Headers: Authorization: Bearer <access_token>
 * // Response: 204 No Content
 */
export async function removeFavorite(req: Request, res: Response) {
	try {
		const userId = requireAuth(req, res);
		if (!userId) return; // Error response already sent

		const serviceId = Number(req.params.serviceId);
		if (!Number.isFinite(serviceId)) {
			return res.status(400).json({ message: "Invalid service ID" });
		}

		// Find and delete favorite
		const favorite = await Favorite.findOne({
			where: { userId, serviceId },
		});

		if (!favorite) {
			return sendNotFoundError(res, "Favorite not found");
		}

		await favorite.destroy();
		res.status(204).send();
	} catch (err) {
		handleControllerError(err, res);
	}
}

/**
 * Check if a service is favorited by the user
 */
/**
 * @route GET /api/users/me/favorites/:serviceId
 * @description Check if a service is in the authenticated user's favorites
 * @access Authenticated users only (requires valid JWT token)
 * @param {Request} req - Express request object
 * @param {Request.params.serviceId} req.params.serviceId - Service ID to check (required)
 * @param {Response} res - Express response object
 * @returns {Object} 200 - Boolean indicating if service is favorited
 * @returns {Object} 400 - Invalid service ID format
 * @returns {Object} 401 - Unauthorized (missing or invalid token)
 * @example
 * // Request: GET /api/users/me/favorites/1
 * // Headers: Authorization: Bearer <access_token>
 * // Response:
 * {
 *   "isFavorite": true
 * }
 */
export async function checkFavorite(req: Request, res: Response) {
	try {
		const userId = requireAuth(req, res);
		if (!userId) return; // Error response already sent

		const serviceId = Number(req.params.serviceId);
		if (!Number.isFinite(serviceId)) {
			return res.status(400).json({ message: "Invalid service ID" });
		}

		const favorite = await Favorite.findOne({
			where: { userId, serviceId },
		});

		res.json({ isFavorited: !!favorite });
	} catch (err) {
		handleControllerError(err, res);
	}
}
