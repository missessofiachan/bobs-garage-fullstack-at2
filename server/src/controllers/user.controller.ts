import type { Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../db/models/User.js';

// Return the authenticated user's profile
export async function getMyProfile(req: Request, res: Response) {
  try {
    const userId = Number(req.user?.sub);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await User.findByPk(userId, { attributes: ['id', 'email', 'role', 'active', 'createdAt'] });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Update basic profile fields (email optional)
const updateSchema = z.object({
  email: z.string().email().optional(),
  active: z.boolean().optional()
});

export async function updateProfile(req: Request, res: Response) {
  try {
    const userId = Number(req.user?.sub);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const payload = updateSchema.parse(req.body);
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.update(payload);
    res.json({ id: user.id, email: user.email, role: user.role, active: user.active });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: err.issues });
    }
    // Sequelize unique constraint on email
    if (typeof err === 'object' && err && 'name' in err && (err as any).name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Email already in use' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
}
