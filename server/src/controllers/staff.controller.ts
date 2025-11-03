import type { Request, Response } from 'express';
import { z } from 'zod';
import type {
  CreateStaffRequest,
  UpdateStaffRequest,
  FileUploadRequest,
} from '../types/requests.js';
import { Staff } from '../db/models/Staff.js';
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

const staffSchema = z.object({
  name: z.string().min(1),
  role: z.string().optional().default('Staff'),
  bio: z.string().optional().default(''),
  photoUrl: z.string().url().optional().default(''),
  active: z.boolean().optional().default(true),
});

export async function listStaff(req: Request, res: Response) {
  try {
    const query = req.query as { page?: number; limit?: number };
    const { page = 1, limit = 20 } = query;
    
    const offset = (Number(page) - 1) * Number(limit);
    const actualLimit = Math.min(Number(limit), 100); // Cap at 100 per page
    
    const { count, rows: staff } = await Staff.findAndCountAll({
      order: [['name', 'ASC']],
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

export async function createStaff(req: Request, res: Response) {
  try {
    const body = req.body as CreateStaffRequest;
    const s = await Staff.create(body as unknown as Parameters<typeof Staff.create>[0]);
    res.status(201).json(s);
  } catch (err) {
    handleControllerError(err, res, {
      uniqueConstraintMessage: 'Duplicate entry',
    });
  }
}

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
      uniqueConstraintMessage: 'Duplicate entry',
    });
  }
}

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

export async function uploadStaffPhoto(req: Request, res: Response) {
  try {
    const id = parseIdParam(req, res);
    if (id === null) return; // Error response already sent

    const filename = getUploadedFilename((req as unknown as FileUploadRequest).file);
    if (!filename) {
      return sendBadRequest(res, 'No file uploaded');
    }

    const s = await Staff.findByPk(id);
    if (!s) return sendNotFound(res);

    // Delete old photo if it exists
    await deleteOldUpload(s.photoUrl);

    const publicUrl = generatePublicUrl(filename, 'staff');
    await s.update({ photoUrl: publicUrl });
    
    res.status(200).json({ id: s.id, photoUrl: publicUrl });
  } catch (err) {
    handleControllerError(err, res);
  }
}
