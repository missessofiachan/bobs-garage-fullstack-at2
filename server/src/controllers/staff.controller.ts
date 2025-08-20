import type { Request, Response } from 'express';
import { z } from 'zod';
import { Staff } from '../db/models/Staff.js';
import { UPLOADS_PUBLIC_PATH, ROOT_UPLOAD_DIR_ABS } from '../middleware/upload.js';
import fs from 'node:fs/promises';
import path from 'node:path';

const staffSchema = z.object({
  name: z.string().min(1),
  role: z.string().optional().default('Staff'),
  bio: z.string().optional().default(''),
  photoUrl: z.string().url().optional().default(''),
  active: z.boolean().optional().default(true)
});

export async function listStaff(_req: Request, res: Response) {
  try {
    const staff = await Staff.findAll({ order: [['name', 'ASC']] });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getStaffById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' });
    const s = await Staff.findByPk(id);
    if (!s) return res.status(404).json({ message: 'Not found' });
    res.json(s);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function createStaff(req: Request, res: Response) {
  try {
    const body = req.body as any;
    const s = await Staff.create(body);
    res.status(201).json(s);
  } catch (err) {
    if (typeof err === 'object' && err && 'name' in err && (err as any).name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Duplicate entry' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updateStaff(req: Request, res: Response) {
  try {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' });
    const body = req.body as any;
    const s = await Staff.findByPk(id);
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

export async function deleteStaff(req: Request, res: Response) {
  try {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' });
    const s = await Staff.findByPk(id);
    if (!s) return res.status(404).json({ message: 'Not found' });
    await s.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function uploadStaffPhoto(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' });
    // Multer places file on req.file
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });
    const s = await Staff.findByPk(id);
    if (!s) return res.status(404).json({ message: 'Not found' });
    const base = process.env.BASE_URL || 'http://localhost:3000';
    const publicUrl = `${base}${UPLOADS_PUBLIC_PATH}/staff/${file.filename}`;

    // Attempt to delete previous local file if it exists and is under upload dir
    try {
      const prev = s.photoUrl;
      if (prev && typeof prev === 'string') {
        // Only consider URLs that look like our uploads public path
        const uploadsPrefix = `${base}${UPLOADS_PUBLIC_PATH}`;
        if (prev.startsWith(uploadsPrefix)) {
          const relative = prev.slice(uploadsPrefix.length);
          const candidate = path.resolve(path.join(ROOT_UPLOAD_DIR_ABS, '.' + relative));
          // Safety: ensure candidate is within ROOT_UPLOAD_DIR_ABS
          if (candidate.startsWith(path.resolve(ROOT_UPLOAD_DIR_ABS))) {
            await fs.unlink(candidate).catch(() => { /* ignore if file missing */ });
          }
        }
      }
    } catch (err) {
      // ignore cleanup errors
    }

    await s.update({ photoUrl: publicUrl });
    res.status(200).json({ id: s.id, photoUrl: publicUrl });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
}
