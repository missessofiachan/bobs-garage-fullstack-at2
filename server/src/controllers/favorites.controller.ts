/**
 * @author Bob's Garage Team
 * @purpose Favorites controller for managing user-service favorites
 * @version 1.0.0
 */

import type { Request, Response } from 'express';
import { Favorite } from '../db/models/Favorite.js';
import { Service } from '../db/models/Service.js';
import {
  handleControllerError,
  sendNotFound,
  sendConflict,
} from '../utils/errors.js';
import { getUserIdFromRequest } from '../utils/validation.js';

/**
 * List all favorites for the authenticated user
 */
export async function listFavorites(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const favorites = await Favorite.findAll({
      where: { userId },
      include: [
        {
          model: Service,
          attributes: ['id', 'name', 'price', 'description', 'imageUrl'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    // Return just the service data for easier frontend consumption
    const services = favorites.map((fav) => fav.service);
    res.json(services);
  } catch (err) {
    handleControllerError(err, res);
  }
}

/**
 * Add a service to user's favorites
 */
export async function addFavorite(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const serviceId = Number(req.params.serviceId);
    if (!Number.isFinite(serviceId)) {
      return res.status(400).json({ message: 'Invalid service ID' });
    }

    // Verify service exists
    const service = await Service.findByPk(serviceId);
    if (!service) {
      return sendNotFound(res, 'Service not found');
    }

    // Check if already favorited
    const existing = await Favorite.findOne({
      where: { userId, serviceId },
    });

    if (existing) {
      return sendConflict(res, 'Service already in favorites');
    }

    // Create favorite
    const favorite = await Favorite.create({ userId, serviceId });
    res.status(201).json({
      id: favorite.id,
      serviceId: favorite.serviceId,
      createdAt: favorite.createdAt,
    });
  } catch (err) {
    handleControllerError(err, res);
  }
}

/**
 * Remove a service from user's favorites
 */
export async function removeFavorite(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const serviceId = Number(req.params.serviceId);
    if (!Number.isFinite(serviceId)) {
      return res.status(400).json({ message: 'Invalid service ID' });
    }

    // Find and delete favorite
    const favorite = await Favorite.findOne({
      where: { userId, serviceId },
    });

    if (!favorite) {
      return sendNotFound(res, 'Favorite not found');
    }

    await favorite.destroy();
    res.status(204).send();
  } catch (err) {
    handleControllerError(err, res);
  }
}

/**
 * Check if a service is favorited by the user
 */
export async function checkFavorite(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const serviceId = Number(req.params.serviceId);
    if (!Number.isFinite(serviceId)) {
      return res.status(400).json({ message: 'Invalid service ID' });
    }

    const favorite = await Favorite.findOne({
      where: { userId, serviceId },
    });

    res.json({ isFavorited: !!favorite });
  } catch (err) {
    handleControllerError(err, res);
  }
}

