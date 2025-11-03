import { Router, type Router as RouterType } from 'express';
import * as Favorites from '../controllers/favorites.controller.js';
import { requireAuth } from '../middleware/auth.js';

const r: RouterType = Router();

// All routes require authentication
r.get('/', requireAuth, Favorites.listFavorites);
r.post('/:serviceId', requireAuth, Favorites.addFavorite);
r.delete('/:serviceId', requireAuth, Favorites.removeFavorite);
r.get('/:serviceId', requireAuth, Favorites.checkFavorite);

export default r;

