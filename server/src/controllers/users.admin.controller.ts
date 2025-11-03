import type { Request, Response } from 'express';
import { z } from 'zod';
import type { UserQueryParams, CreateUserRequest, UpdateUserRequest } from '../types/requests.js';
import { User } from '../db/models/User.js';
import { hashPassword } from '../utils/hash.js';
import {
  handleControllerError,
  sendNotFound,
} from '../utils/errors.js';
import { parseIdParam } from '../utils/validation.js';

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

export async function listUsers(req: Request, res: Response) {
  try {
    const query = req.query as unknown as UserQueryParams;
    const { page = 1, limit = 20, role, active } = query;
    
    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (typeof active !== 'undefined') where.active = active;
    
    const offset = (Number(page) - 1) * Number(limit);
    const actualLimit = Math.min(Number(limit), 100); // Cap at 100 per page
    
    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: ['id', 'email', 'role', 'active', 'createdAt'],
      limit: actualLimit,
      offset,
      order: [['createdAt', 'DESC']],
    });
    
    res.json({
      data: users,
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

export async function getUserById(req: Request, res: Response) {
  try {
    const id = parseIdParam(req, res);
    if (id === null) return; // Error response already sent

    const user = await User.findByPk(id, {
      attributes: ['id', 'email', 'role', 'active', 'createdAt'],
    });
    if (!user) return sendNotFound(res);

    res.json(user);
  } catch (err) {
    handleControllerError(err, res);
  }
}

export async function createUser(req: Request, res: Response) {
  try {
    const payload = createSchema.parse(req.body) as CreateUserRequest;
    const passwordHash = await hashPassword(payload.password);
    const user = await User.create({
      email: payload.email,
      passwordHash,
      role: payload.role,
      active: payload.active,
    });
    res.status(201).json({
      id: user.id,
      email: user.email,
      role: user.role,
      active: user.active,
    });
  } catch (err) {
    handleControllerError(err, res, {
      uniqueConstraintMessage: 'Email already in use',
    });
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const id = parseIdParam(req, res);
    if (id === null) return; // Error response already sent

    const payload = updateSchema.parse(req.body) as UpdateUserRequest;
    const user = await User.findByPk(id);
    if (!user) return sendNotFound(res);

    if (payload.password) {
      const passwordHash = await hashPassword(payload.password);
      await user.update({ passwordHash });
    }
    
    await user.update({
      email: payload.email ?? user.email,
      role: payload.role ?? user.role,
      active: payload.active ?? user.active,
    });
    
    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      active: user.active,
    });
  } catch (err) {
    handleControllerError(err, res, {
      uniqueConstraintMessage: 'Email already in use',
    });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const id = parseIdParam(req, res);
    if (id === null) return; // Error response already sent

    const user = await User.findByPk(id);
    if (!user) return sendNotFound(res);

    await user.destroy();
    res.status(204).send();
  } catch (err) {
    handleControllerError(err, res);
  }
}
