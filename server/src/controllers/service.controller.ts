import { z } from 'zod';
import { Service } from '../db/models/Service.js';
import { UPLOADS_PUBLIC_PATH } from '../middleware/upload.js';
import { Op } from 'sequelize';
import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT_UPLOAD_DIR_ABS } from '../middleware/upload.js';
import type { Request, Response } from 'express';

const serviceSchema = z.object({
  name: z.string().min(2),
  price: z.coerce.number().nonnegative(),
  description: z.string().min(2),
  imageUrl: z.string().url().optional().default(''),
  published: z.boolean().default(true)
});

// List all services
export async function listServices(req: Request, res: Response) {
  try {
    // Filters: active (published), q (name contains), minPrice, maxPrice, sort
    const { q, minPrice, maxPrice, active, sort } = req.query as Record<string, string | undefined>;
    const where: any = {};
    if (typeof active !== 'undefined') where.published = ['1', 'true', 'yes'].includes(String(active).toLowerCase());
    if (q) where.name = { [Op.like]: `%${q}%` };
    if (minPrice || maxPrice) where.price = {};
    if (minPrice) where.price[Op.gte] = Number(minPrice);
    if (maxPrice) where.price[Op.lte] = Number(maxPrice);
    let order: any = [['name', 'ASC']];
    if (sort) {
      const [f, dir] = String(sort).split(':');
      const field: string = f || 'name';
      const allowed = new Set(['name', 'price', 'createdAt']);
      const direction = String(dir || 'ASC').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      if (allowed.has(field)) order = [[field, direction]];
    }
    const services = await Service.findAll({ where, order });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Get a single service by ID
export async function getServiceById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' });
    const s = await Service.findByPk(id);
    if (!s) return res.status(404).json({ message: 'Not found' });
    res.json(s);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
}
// Create a new service with validation and error handling
export async function createService(req: Request, res: Response) {
  try {
    const body = req.body as any;
    const s = await Service.create(body);
    res.status(201).json(s);
  } catch (err) {
    if (typeof err === 'object' && err && 'name' in err && (err as any).name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Duplicate entry' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
}
// Update a service by ID with validation and error handling
export async function updateService(req: Request, res: Response) {
  try {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' });
    const body = req.body as any;
    const s = await Service.findByPk(id);
    if (!s) return res.status(404).json({ message: 'Not found' });
    await s.update(body);
    res.json(s);
  } catch (err) {
    if (typeof err === 'object' && err && 'name' in err && (err as any).name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Duplicate entry' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
}
// Delete a service by ID with error handling
export async function deleteService(req: Request, res: Response) {
  try {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' });
    const s = await Service.findByPk(id);
    if (!s) return res.status(404).json({ message: 'Not found' });
    await s.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Upload a service image and set imageUrl
export async function uploadServiceImage(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' });
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });
    const s = await Service.findByPk(id);
    if (!s) return res.status(404).json({ message: 'Not found' });
    const base = process.env.BASE_URL || 'http://localhost:3000';
    const publicUrl = `${base}${UPLOADS_PUBLIC_PATH}/services/${file.filename}`;
    // Attempt to remove previous local file if it's under our uploads dir
    try {
      const prev = s.imageUrl;
      if (prev && typeof prev === 'string') {
        const uploadsPrefix = `${base}${UPLOADS_PUBLIC_PATH}`;
        if (prev.startsWith(uploadsPrefix)) {
          const relative = prev.slice(uploadsPrefix.length);
          const candidate = path.resolve(path.join(ROOT_UPLOAD_DIR_ABS, '.' + relative));
          if (candidate.startsWith(path.resolve(ROOT_UPLOAD_DIR_ABS))) {
            await fs.unlink(candidate).catch(() => {});
          }
        }
      }
    } catch (err) {
      // ignore cleanup errors
    }

    await s.update({ imageUrl: publicUrl });
    res.status(200).json({ id: s.id, imageUrl: publicUrl });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
}
