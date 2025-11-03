import type { Request, Response } from 'express';
import { User } from '../db/models/User.js';
import { Service } from '../db/models/Service.js';
import { Staff } from '../db/models/Staff.js';
import { handleControllerError } from '../utils/errors.js';

// Simple admin metrics: counts of key resources
export async function getMetrics(_req: Request, res: Response) {
  try {
    const [users, services, staff] = await Promise.all([
      User.count(),
      Service.count(),
      Staff.count(),
    ]);
    res.json({ users, services, staff });
  } catch (err) {
    handleControllerError(err, res);
  }
}
