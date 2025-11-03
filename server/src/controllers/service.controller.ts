import { z } from 'zod';
import { Service } from '../db/models/Service.js';
import { Op } from 'sequelize';
import type { Request, Response } from 'express';
import type {
  CreateServiceRequest,
  UpdateServiceRequest,
  ServiceQueryParams,
  FileUploadRequest,
} from '../types/requests.js';
import {
  handleControllerError,
  sendBadRequest,
  sendNotFound,
} from '../utils/errors.js';
import { parseIdParam } from '../utils/validation.js';
import {
  generatePublicUrl,
  getUploadedFilename,
  deleteOldUpload,
} from '../services/upload.service.js';

const serviceSchema = z.object({
  name: z.string().min(2),
  price: z.coerce.number().nonnegative(),
  description: z.string().min(2),
  imageUrl: z.string().url().optional().default(''),
  published: z.boolean().default(true),
});

// List all services
export async function listServices(req: Request, res: Response) {
  try {
    // Filters: active (published), q (name contains), minPrice, maxPrice, sort
    const query = req.query as unknown as ServiceQueryParams;
    const { q, minPrice, maxPrice, active, sort, page = 1, limit = 20 } = query;
    
    const where: Record<string, unknown> = {};
    if (typeof active !== 'undefined')
      where.published = ['1', 'true', 'yes'].includes(
        String(active).toLowerCase(),
      );
    if (q) where.name = { [Op.like]: `%${q}%` };
    if (minPrice || maxPrice) {
      const priceWhere: Record<string, unknown> = {};
      if (minPrice) priceWhere[Op.gte as unknown as string] = Number(minPrice);
      if (maxPrice) priceWhere[Op.lte as unknown as string] = Number(maxPrice);
      where.price = priceWhere;
    }
    
    let order: [string, 'ASC' | 'DESC'][] = [['name', 'ASC']];
    if (sort) {
      const [f, dir] = String(sort).split(':');
      const field: string = f || 'name';
      const allowed = new Set(['name', 'price', 'createdAt']);
      const direction =
        String(dir || 'ASC').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      if (allowed.has(field)) order = [[field, direction]];
    }
    // Pagination
    const offset = (Number(page) - 1) * Number(limit);
    const actualLimit = Math.min(Number(limit), 100); // Cap at 100 per page
    
    const { count, rows: services } = await Service.findAndCountAll({
      where,
      order,
      limit: actualLimit,
      offset,
    });
    
    res.json({
      data: services,
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

// Get a single service by ID
export async function getServiceById(req: Request, res: Response) {
  try {
    const id = parseIdParam(req, res);
    if (id === null) return; // Error response already sent

    const s = await Service.findByPk(id);
    if (!s) return sendNotFound(res);

    res.json(s);
  } catch (err) {
    handleControllerError(err, res);
  }
}

// Create a new service with validation and error handling
export async function createService(req: Request, res: Response) {
  try {
    const body = req.body as CreateServiceRequest;
    const s = await Service.create(body as unknown as Parameters<typeof Service.create>[0]);
    res.status(201).json(s);
  } catch (err) {
    handleControllerError(err, res, {
      uniqueConstraintMessage: 'Duplicate entry',
    });
  }
}

// Update a service by ID with validation and error handling
export async function updateService(req: Request, res: Response) {
  try {
    const id = parseIdParam(req, res);
    if (id === null) return; // Error response already sent

    const body = req.body as UpdateServiceRequest;
    const s = await Service.findByPk(id);
    if (!s) return sendNotFound(res);

    await s.update(body);
    res.json(s);
  } catch (err) {
    handleControllerError(err, res, {
      uniqueConstraintMessage: 'Duplicate entry',
    });
  }
}

// Delete a service by ID with error handling
export async function deleteService(req: Request, res: Response) {
  try {
    const id = parseIdParam(req, res);
    if (id === null) return; // Error response already sent

    const s = await Service.findByPk(id);
    if (!s) return sendNotFound(res);

    await s.destroy();
    res.status(204).send();
  } catch (err) {
    handleControllerError(err, res);
  }
}

// Upload a service image and set imageUrl
export async function uploadServiceImage(req: Request, res: Response) {
  try {
    const id = parseIdParam(req, res);
    if (id === null) return; // Error response already sent

    const filename = getUploadedFilename((req as unknown as FileUploadRequest).file);
    if (!filename) {
      return sendBadRequest(res, 'No file uploaded');
    }

    const s = await Service.findByPk(id);
    if (!s) return sendNotFound(res);

    // Delete old image if it exists
    await deleteOldUpload(s.imageUrl);

    const publicUrl = generatePublicUrl(filename, 'services');
    await s.update({ imageUrl: publicUrl });
    
    res.status(200).json({ id: s.id, imageUrl: publicUrl });
  } catch (err) {
    handleControllerError(err, res);
  }
}
