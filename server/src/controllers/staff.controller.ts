/**
 * @author Bob's Garage Team
 * @purpose Staff controller for CRUD operations and photo uploads for team members
 * @version 1.0.0
 */

import type { Request, Response } from "express";
import { z } from "zod";
import { Staff } from "../db/models/Staff.js";
import {
	deleteOldUpload,
	generatePublicUrl,
	getUploadedFilename,
} from "../services/upload.service.js";
import type {
	CreateStaffRequest,
	FileUploadRequest,
	UpdateStaffRequest,
} from "../types/requests.js";
import { handleControllerError, sendBadRequest, sendNotFound } from "../utils/errors.js";
import { parseIdParam } from "../utils/validation.js";

const staffSchema = z.object({
	name: z.string().min(1),
	role: z.string().optional().default("Staff"),
	bio: z.string().optional().default(""),
	photoUrl: z.string().url().optional().default(""),
	active: z.boolean().optional().default(true),
});

/**
 * @route GET /api/staff
 * @description List all staff members with pagination
 * @access Public
 * @param {Request} req - Express request object
 * @param {Request.query.page} req.query.page - Page number (default: 1)
 * @param {Request.query.limit} req.query.limit - Items per page (default: 20, max: 100)
 * @param {Response} res - Express response object
 * @returns {Object} 200 - Paginated list of staff members
 * @example
 * // GET /api/staff?page=1&limit=20
 * // Response:
 * {
 *   "data": [
 *     {
 *       "id": 1,
 *       "name": "Bob Smith",
 *       "role": "Owner/Mechanic",
 *       "bio": "30 years of experience",
 *       "photoUrl": "http://localhost:4000/uploads/staff/photo.jpg",
 *       "active": true
 *     }
 *   ],
 *   "pagination": {
 *     "page": 1,
 *     "limit": 20,
 *     "total": 4,
 *     "pages": 1
 *   }
 * }
 */
export async function listStaff(req: Request, res: Response) {
	try {
		const query = req.query as { page?: number; limit?: number };
		const { page = 1, limit = 20 } = query;

		const offset = (Number(page) - 1) * Number(limit);
		const actualLimit = Math.min(Number(limit), 100); // Cap at 100 per page

		const { count, rows: staff } = await Staff.findAndCountAll({
			order: [["name", "ASC"]],
			limit: actualLimit,
			offset,
		});

		res.json({
			data: staff,
			pagination: {
				page: Number(page),
				limit: actualLimit,
				total: count,
				pages: Math.ceil(count / actualLimit),
			},
		});
	} catch (err) {
		handleControllerError(err, res);
	}
}

/**
 * @route GET /api/staff/:id
 * @description Get a single staff member by ID
 * @access Public
 * @param {Request} req - Express request object
 * @param {Request.params.id} req.params.id - Staff ID (required)
 * @param {Response} res - Express response object
 * @returns {Object} 200 - Staff member object
 * @returns {Object} 404 - Staff member not found
 * @returns {Object} 400 - Invalid ID format
 */
export async function getStaffById(req: Request, res: Response) {
	try {
		const id = parseIdParam(req, res);
		if (id === null) return; // Error response already sent

		const s = await Staff.findByPk(id);
		if (!s) return sendNotFound(res);

		res.json(s);
	} catch (err) {
		handleControllerError(err, res);
	}
}

/**
 * @route POST /api/staff
 * @description Create a new staff member
 * @access Admin only (requires authentication and admin role)
 * @param {Request} req - Express request object
 * @param {Request.body.name} req.body.name - Staff member name (required, min 1 character)
 * @param {Request.body.role} req.body.role - Staff role/position (optional, default: "Staff")
 * @param {Request.body.bio} req.body.bio - Staff biography (optional)
 * @param {Request.body.photoUrl} req.body.photoUrl - Staff photo URL (optional)
 * @param {Request.body.active} req.body.active - Active status (optional, default: true)
 * @param {Response} res - Express response object
 * @returns {Object} 201 - Created staff member object
 * @returns {Object} 400 - Validation error
 * @returns {Object} 401 - Unauthorized (missing or invalid token)
 * @returns {Object} 403 - Forbidden (not admin)
 */
export async function createStaff(req: Request, res: Response) {
	try {
		const body = req.body as CreateStaffRequest;
		const s = await Staff.create(body as unknown as Parameters<typeof Staff.create>[0]);
		res.status(201).json(s);
	} catch (err) {
		handleControllerError(err, res, {
			uniqueConstraintMessage: "Duplicate entry",
		});
	}
}

/**
 * @route PUT /api/staff/:id
 * @description Update a staff member by ID
 * @access Admin only (requires authentication and admin role)
 * @param {Request} req - Express request object
 * @param {Request.params.id} req.params.id - Staff ID (required)
 * @param {Request.body} req.body - Partial staff object (all fields optional)
 * @param {Response} res - Express response object
 * @returns {Object} 200 - Updated staff member object
 * @returns {Object} 400 - Validation error or invalid ID
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 403 - Forbidden (not admin)
 * @returns {Object} 404 - Staff member not found
 */
export async function updateStaff(req: Request, res: Response) {
	try {
		const id = parseIdParam(req, res);
		if (id === null) return; // Error response already sent

		const body = req.body as UpdateStaffRequest;
		const s = await Staff.findByPk(id);
		if (!s) return sendNotFound(res);

		await s.update(body);
		res.json(s);
	} catch (err) {
		handleControllerError(err, res, {
			uniqueConstraintMessage: "Duplicate entry",
		});
	}
}

/**
 * @route DELETE /api/staff/:id
 * @description Delete a staff member by ID
 * @access Admin only (requires authentication and admin role)
 * @param {Request} req - Express request object
 * @param {Request.params.id} req.params.id - Staff ID (required)
 * @param {Response} res - Express response object
 * @returns {void} 204 - Staff member deleted successfully
 * @returns {Object} 400 - Invalid ID format
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 403 - Forbidden (not admin)
 * @returns {Object} 404 - Staff member not found
 */
export async function deleteStaff(req: Request, res: Response) {
	try {
		const id = parseIdParam(req, res);
		if (id === null) return; // Error response already sent

		const s = await Staff.findByPk(id);
		if (!s) return sendNotFound(res);

		await s.destroy();
		res.status(204).send();
	} catch (err) {
		handleControllerError(err, res);
	}
}

/**
 * @route POST /api/staff/:id/image
 * @description Upload a photo for a staff member and update the staff's photoUrl
 * @access Admin only (requires authentication and admin role)
 * @param {Request} req - Express request object
 * @param {Request.params.id} req.params.id - Staff ID (required)
 * @param {Request.file} req.file - Image file (multipart/form-data, field name: "image")
 * @param {Response} res - Express response object
 * @returns {Object} 200 - Updated staff member with new photoUrl
 * @returns {Object} 400 - No file uploaded or invalid ID
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 403 - Forbidden (not admin)
 * @returns {Object} 404 - Staff member not found
 * @example
 * // Request: POST /api/staff/1/image
 * // Content-Type: multipart/form-data
 * // Body: image file (max size: 2MB, formats: jpg, png, gif, webp, svg)
 * // Response:
 * {
 *   "id": 1,
 *   "photoUrl": "http://localhost:4000/uploads/staff/1234567890-photo.jpg"
 * }
 */
export async function uploadStaffPhoto(req: Request, res: Response) {
	try {
		const id = parseIdParam(req, res);
		if (id === null) return; // Error response already sent

		const filename = getUploadedFilename((req as unknown as FileUploadRequest).file);
		if (!filename) {
			return sendBadRequest(res, "No file uploaded");
		}

		const s = await Staff.findByPk(id);
		if (!s) return sendNotFound(res);

		// Delete old photo if it exists
		await deleteOldUpload(s.photoUrl);

		const publicUrl = generatePublicUrl(filename, "staff");
		await s.update({ photoUrl: publicUrl });

		res.status(200).json({ id: s.id, photoUrl: publicUrl });
	} catch (err) {
		handleControllerError(err, res);
	}
}
