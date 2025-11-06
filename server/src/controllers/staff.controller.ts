/**
 * @author Bob's Garage Team
 * @purpose Staff controller for CRUD operations and photo uploads for team members
 * @version 1.0.0
 */

import type { Request, Response } from "express";
import { z } from "zod";
import { invalidateCache } from "../middleware/cache.js";
import { logCreate, logDelete, logUpdate, logUpload } from "../services/audit.service.js";
import * as staffService from "../services/staff.service.js";
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
import { sendNotFoundError, sendValidationError } from "../utils/errorResponse.js";
import { handleControllerError } from "../utils/errors.js";
import { createPaginationResponse } from "../utils/responses.js";
import { findByIdOr404, parseIdParam } from "../utils/validation.js";

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

		const {
			staff,
			total,
			page: actualPage,
			limit: actualLimit,
		} = await staffService.listStaff(page, limit);

		res.json({
			data: staff,
			pagination: createPaginationResponse(actualPage, actualLimit, total),
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
		const s = await findByIdOr404(req, res, (id) => staffService.getStaffById(id));
		if (!s) return; // Error response already sent

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
		const s = await staffService.createStaff(body);

		// Invalidate cache for staff list
		await invalidateCache("staff");

		// Log audit event
		await logCreate(req, "staff", s.id, `Created staff member: ${s.name}`, s.toJSON());

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

		// Get previous state before update
		const existingStaff = await staffService.getStaffById(id);
		if (!existingStaff) return sendNotFoundError(res);
		const previousState = existingStaff.toJSON();

		const body = req.body as UpdateStaffRequest;
		const s = await staffService.updateStaff(id, body);
		if (!s) return sendNotFoundError(res);

		// Reload to get updated state
		await s.reload();
		const newState = s.toJSON();

		// Invalidate cache for this staff member and list
		await invalidateCache("staff", id);

		// Log audit event
		await logUpdate(req, "staff", id, `Updated staff member: ${s.name}`, previousState, newState);

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

		// Get staff before deletion for audit log
		const s = await staffService.getStaffById(id);
		if (!s) return sendNotFoundError(res);

		const previousState = s.toJSON();

		// Delete staff member
		await staffService.deleteStaff(id);

		// Invalidate cache for this staff member and list
		await invalidateCache("staff", id);

		// Log audit event
		await logDelete(req, "staff", id, `Deleted staff member: ${s.name}`, previousState);

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
			return sendValidationError(res, "No file uploaded");
		}

		const s = await staffService.getStaffById(id);
		if (!s) return sendNotFoundError(res);

		// Delete old photo if it exists
		await deleteOldUpload(s.photoUrl);

		const publicUrl = generatePublicUrl(filename, "staff");
		await staffService.updateStaffPhotoUrl(id, publicUrl);

		// Invalidate cache for this staff member
		await invalidateCache("staff", id);

		// Log audit event
		await logUpload(req, "staff", id, `Uploaded photo for staff member: ${s.name}`);

		res.status(200).json({ id, photoUrl: publicUrl });
	} catch (err) {
		handleControllerError(err, res);
	}
}
