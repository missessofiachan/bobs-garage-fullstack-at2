/**
 * @file service.controller.ts
 * @author Bob's Garage Team
 * @description Service controller managing CRUD operations for garage services with image upload support.
 *              Handles public listing/filtering and admin-only create/update/delete operations.
 * @version 1.0.0
 * @since 1.0.0
 */

import type { Request, Response } from 'express';
import { invalidateCache } from '../middleware/cache.js';
import { logCreate, logDelete, logUpdate, logUpload } from '../services/audit.service.js';
import * as serviceService from '../services/service.service.js';
import {
  deleteOldUpload,
  generatePublicUrl,
  getUploadedFilename,
} from '../services/upload.service.js';
import type {
  CreateServiceRequest,
  FileUploadRequest,
  ServiceQueryParams,
  UpdateServiceRequest,
} from '../types/requests.js';
import { sendNotFoundError, sendValidationError } from '../utils/errorResponse.js';
import { handleControllerError } from '../utils/errors.js';
import { createPaginationResponse } from '../utils/responses.js';
import { findByIdOr404, parseIdParam } from '../utils/validation.js';

/**
 * @route GET /api/services
 * @description List all services with optional filtering, sorting, and pagination
 * @access Public
 * @param {Request} req - Express request object
 * @param {Request.query.q} req.query.q - Search query (filters by name)
 * @param {Request.query.minPrice} req.query.minPrice - Minimum price filter
 * @param {Request.query.maxPrice} req.query.maxPrice - Maximum price filter
 * @param {Request.query.active} req.query.active - Filter by published status (true/false)
 * @param {Request.query.sort} req.query.sort - Sort field and direction (e.g., "price:asc", "name:desc")
 * @param {Request.query.page} req.query.page - Page number (default: 1)
 * @param {Request.query.limit} req.query.limit - Items per page (default: 20, max: 100)
 * @param {Response} res - Express response object
 * @returns {Object} 200 - Paginated list of services
 * @example
 * // GET /api/services?q=oil&minPrice=50&sort=price:asc&page=1&limit=20
 * // Response:
 * {
 *   "data": [
 *     {
 *       "id": 1,
 *       "name": "Oil Change",
 *       "price": 75.00,
 *       "description": "Full synthetic oil change",
 *       "imageUrl": "http://localhost:4000/uploads/services/image.jpg",
 *       "published": true
 *     }
 *   ],
 *   "pagination": {
 *     "page": 1,
 *     "limit": 20,
 *     "total": 10,
 *     "pages": 1
 *   }
 * }
 */
export async function listServices(req: Request, res: Response) {
  try {
    const query = req.query as unknown as ServiceQueryParams;
    const { services, total, page, limit } = await serviceService.listServices(query);

    res.json({
      data: services,
      pagination: createPaginationResponse(page, limit, total),
    });
  } catch (err) {
    handleControllerError(err, res);
  }
}

/**
 * @route GET /api/services/:id
 * @description Get a single service by ID
 * @access Public
 * @param {Request} req - Express request object
 * @param {Request.params.id} req.params.id - Service ID (required)
 * @param {Response} res - Express response object
 * @returns {Object} 200 - Service object
 * @returns {Object} 404 - Service not found
 * @returns {Object} 400 - Invalid ID format
 */
export async function getServiceById(req: Request, res: Response) {
  try {
    const s = await findByIdOr404(req, res, (id) => serviceService.getServiceById(id));
    if (!s) return; // Error response already sent

    res.json(s);
  } catch (err) {
    handleControllerError(err, res);
  }
}

/**
 * @route POST /api/services
 * @description Create a new service
 * @access Admin only (requires authentication and admin role)
 * @param {Request} req - Express request object
 * @param {Request.body.name} req.body.name - Service name (required, min 2 characters)
 * @param {Request.body.price} req.body.price - Service price (required, must be non-negative)
 * @param {Request.body.description} req.body.description - Service description (required, min 2 characters)
 * @param {Request.body.imageUrl} req.body.imageUrl - Service image URL (optional)
 * @param {Request.body.published} req.body.published - Published status (optional, default: true)
 * @param {Response} res - Express response object
 * @returns {Object} 201 - Created service object
 * @returns {Object} 400 - Validation error
 * @returns {Object} 401 - Unauthorized (missing or invalid token)
 * @returns {Object} 403 - Forbidden (not admin)
 */
export async function createService(req: Request, res: Response) {
  try {
    const body = req.body as CreateServiceRequest;
    const s = await serviceService.createService(body);

    // Invalidate cache for services list
    await invalidateCache('services');

    // Log audit event
    await logCreate(req, 'service', s.id, `Created service: ${s.name}`, s.toJSON());

    res.status(201).json(s);
  } catch (err) {
    handleControllerError(err, res, {
      uniqueConstraintMessage: 'Duplicate entry',
    });
  }
}

/**
 * @route PUT /api/services/:id
 * @description Update a service by ID
 * @access Admin only (requires authentication and admin role)
 * @param {Request} req - Express request object
 * @param {Request.params.id} req.params.id - Service ID (required)
 * @param {Request.body} req.body - Partial service object (all fields optional)
 * @param {Response} res - Express response object
 * @returns {Object} 200 - Updated service object
 * @returns {Object} 400 - Validation error or invalid ID
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 403 - Forbidden (not admin)
 * @returns {Object} 404 - Service not found
 */
export async function updateService(req: Request, res: Response) {
  try {
    const id = parseIdParam(req, res);
    if (id === null) return; // Error response already sent

    // Get previous state before update
    const existingService = await serviceService.getServiceById(id);
    if (!existingService) return sendNotFoundError(res);
    const previousState = existingService.toJSON();

    const body = req.body as UpdateServiceRequest;
    const s = await serviceService.updateService(id, body);
    if (!s) return sendNotFoundError(res);

    // Reload to get updated state
    await s.reload();
    const newState = s.toJSON();

    // Invalidate cache for this service and list
    await invalidateCache('services', id);

    // Log audit event
    await logUpdate(req, 'service', id, `Updated service: ${s.name}`, previousState, newState);

    res.json(s);
  } catch (err) {
    handleControllerError(err, res, {
      uniqueConstraintMessage: 'Duplicate entry',
    });
  }
}

/**
 * @route DELETE /api/services/:id
 * @description Delete a service by ID
 * @access Admin only (requires authentication and admin role)
 * @param {Request} req - Express request object
 * @param {Request.params.id} req.params.id - Service ID (required)
 * @param {Response} res - Express response object
 * @returns {void} 204 - Service deleted successfully
 * @returns {Object} 400 - Invalid ID format
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 403 - Forbidden (not admin)
 * @returns {Object} 404 - Service not found
 */
export async function deleteService(req: Request, res: Response) {
  try {
    const id = parseIdParam(req, res);
    if (id === null) return; // Error response already sent

    // Get service before deletion for audit log
    const s = await serviceService.getServiceById(id);
    if (!s) return sendNotFoundError(res);

    const previousState = s.toJSON();

    // Delete service (service layer handles favorites cleanup)
    await serviceService.deleteService(id);

    // Invalidate cache for this service and list
    await invalidateCache('services', id);

    // Log audit event
    await logDelete(req, 'service', id, `Deleted service: ${s.name}`, previousState);

    res.status(204).send();
  } catch (err) {
    handleControllerError(err, res);
  }
}

/**
 * @route POST /api/services/:id/image
 * @description Upload an image for a service and update the service's imageUrl
 * @access Admin only (requires authentication and admin role)
 * @param {Request} req - Express request object
 * @param {Request.params.id} req.params.id - Service ID (required)
 * @param {Request.file} req.file - Image file (multipart/form-data, field name: "image")
 * @param {Response} res - Express response object
 * @returns {Object} 200 - Updated service with new imageUrl
 * @returns {Object} 400 - No file uploaded or invalid ID
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 403 - Forbidden (not admin)
 * @returns {Object} 404 - Service not found
 * @example
 * // Request: POST /api/services/1/image
 * // Content-Type: multipart/form-data
 * // Body: image file (max size: 2MB, formats: jpg, png, gif, webp, svg)
 * // Response:
 * {
 *   "id": 1,
 *   "imageUrl": "http://localhost:4000/uploads/services/1234567890-image.jpg"
 * }
 */
export async function uploadServiceImage(req: Request, res: Response) {
  try {
    const id = parseIdParam(req, res);
    if (id === null) return; // Error response already sent

    const filename = getUploadedFilename((req as unknown as FileUploadRequest).file);
    if (!filename) {
      return sendValidationError(res, 'No file uploaded');
    }

    const s = await serviceService.getServiceById(id);
    if (!s) return sendNotFoundError(res);

    // Delete old image if it exists
    await deleteOldUpload(s.imageUrl);

    const publicUrl = generatePublicUrl(filename, 'services');
    await serviceService.updateServiceImageUrl(id, publicUrl);

    // Invalidate cache for this service
    await invalidateCache('services', id);

    // Log audit event
    await logUpload(req, 'service', id, `Uploaded image for service: ${s.name}`);

    res.status(200).json({ id, imageUrl: publicUrl });
  } catch (err) {
    handleControllerError(err, res);
  }
}
