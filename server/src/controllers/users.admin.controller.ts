import type { Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../db/models/User.js';
import { hashPassword } from '../utils/hash.js';

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['user', 'admin']).default('user'),
  active: z.boolean().default(true),
});

const updateSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  role: z.enum(['user', 'admin']).optional(),
  active: z.boolean().optional(),
});

export async function listUsers(_req: Request, res: Response) {
  try {
    const users = await User.findAll({ attributes: ['id', 'email', 'role', 'active', 'createdAt'] });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getUserById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' });
    const user = await User.findByPk(id, { attributes: ['id', 'email', 'role', 'active', 'createdAt'] });
    if (!user) return res.status(404).json({ message: 'Not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function createUser(req: Request, res: Response) {
  try {
    const payload = createSchema.parse(req.body);
    const passwordHash = await hashPassword(payload.password);
    const user = await User.create({ email: payload.email, passwordHash, role: payload.role, active: payload.active });
    res.status(201).json({ id: user.id, email: user.email, role: user.role, active: user.active });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ message: 'Validation error', errors: err.issues });
    if (typeof err === 'object' && err && 'name' in err && (err as any).name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Email already in use' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' });
    const payload = updateSchema.parse(req.body);
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Not found' });
    if (payload.password) {
      const passwordHash = await hashPassword(payload.password);
      await user.update({ passwordHash });
    }
    await user.update({ email: payload.email ?? user.email, role: payload.role ?? user.role, active: payload.active ?? user.active });
    res.json({ id: user.id, email: user.email, role: user.role, active: user.active });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ message: 'Validation error', errors: err.issues });
    if (typeof err === 'object' && err && 'name' in err && (err as any).name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Email already in use' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' });
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Not found' });
    await user.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
}
