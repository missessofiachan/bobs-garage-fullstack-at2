import { z } from 'zod';
import { Service } from '../db/models/Service.js';
import type { Request, Response } from 'express';

const serviceSchema = z.object({
  name: z.string().min(2),
  price: z.coerce.number().nonnegative(),
  description: z.string().min(2),
  imageUrl: z.string().url().optional().default(''),
  published: z.boolean().default(true)
});

// List all services
export async function listServices(_req: Request, res: Response) {
  try {
    const services = await Service.findAll({ order: [['name', 'ASC']] });
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
    const body = serviceSchema.parse(req.body);
    const s = await Service.create(body);
    res.status(201).json(s);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: err.issues });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
}
// Update a service by ID with validation and error handling
export async function updateService(req: Request, res: Response) {
  try {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' });
    const body = serviceSchema.partial().parse(req.body);
    const s = await Service.findByPk(id);
    if (!s) return res.status(404).json({ message: 'Not found' });
    await s.update(body);
    res.json(s);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: err.issues });
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
