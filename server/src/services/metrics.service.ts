/**
 * @file metrics.service.ts
 * @author Bob's Garage Team
 * @description Service layer for Prometheus metrics, cache metrics, and dashboard statistics
 * @version 1.0.0
 * @since 1.0.0
 */

import { Counter, Histogram, register as promRegister } from 'prom-client';
import { Op } from 'sequelize';
import { Favorite } from '../db/models/Favorite.js';
import { Service } from '../db/models/Service.js';
import { Staff } from '../db/models/Staff.js';
import { User } from '../db/models/User.js';

// Prometheus metrics registry
export const register = promRegister;

// HTTP request metrics
export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

export const httpErrorsTotal = new Counter({
  name: 'http_errors_total',
  help: 'Total number of HTTP errors (4xx and 5xx)',
  labelNames: ['method', 'route', 'status_code'],
});

// Cache metrics
const cacheHits = new Counter({
  name: 'cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['cache_type'],
});

const cacheMisses = new Counter({
  name: 'cache_misses_total',
  help: 'Total number of cache misses',
  labelNames: ['cache_type'],
});

/**
 * Record a cache hit
 */
export function recordCacheHit(cacheType: string | undefined): void {
  cacheHits.inc({ cache_type: cacheType || 'unknown' });
}

/**
 * Record a cache miss
 */
export function recordCacheMiss(cacheType: string | undefined): void {
  cacheMisses.inc({ cache_type: cacheType || 'unknown' });
}

/**
 * Get Prometheus metrics in text format
 */
export async function getMetrics(): Promise<string> {
  return register.metrics();
}

// Dashboard metrics interface and function
export interface DashboardMetricsResponse {
  users: {
    total: number;
    active: number;
    inactive: number;
    admins: number;
    recent: number; // Users created in last 7 days
  };
  services: {
    total: number;
    published: number;
    unpublished: number;
    recent: number; // Services created in last 7 days
  };
  staff: {
    total: number;
    active: number;
    inactive: number;
    recent: number; // Staff created in last 7 days
  };
  favorites: {
    total: number;
  };
  recentActivity: {
    usersToday: number;
    servicesToday: number;
    staffToday: number;
  };
}

/**
 * Get comprehensive dashboard metrics for admin overview
 */
export async function getDashboardMetrics(): Promise<DashboardMetricsResponse> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    usersTotal,
    usersActive,
    usersInactive,
    usersAdmins,
    usersRecent,
    usersToday,
    servicesTotal,
    servicesPublished,
    servicesUnpublished,
    servicesRecent,
    servicesToday,
    staffTotal,
    staffActive,
    staffInactive,
    staffRecent,
    staffToday,
    favoritesTotal,
  ] = await Promise.all([
    // Users
    User.count(),
    User.count({ where: { active: true } }),
    User.count({ where: { active: false } }),
    User.count({ where: { role: 'admin' } }),
    User.count({ where: { createdAt: { [Op.gte]: sevenDaysAgo } } }),
    User.count({ where: { createdAt: { [Op.gte]: today } } }),
    // Services
    Service.count(),
    Service.count({ where: { published: true } }),
    Service.count({ where: { published: false } }),
    Service.count({ where: { createdAt: { [Op.gte]: sevenDaysAgo } } }),
    Service.count({ where: { createdAt: { [Op.gte]: today } } }),
    // Staff
    Staff.count(),
    Staff.count({ where: { active: true } }),
    Staff.count({ where: { active: false } }),
    Staff.count({ where: { createdAt: { [Op.gte]: sevenDaysAgo } } }),
    Staff.count({ where: { createdAt: { [Op.gte]: today } } }),
    // Favorites
    Favorite.count(),
  ]);

  return {
    users: {
      total: usersTotal,
      active: usersActive,
      inactive: usersInactive,
      admins: usersAdmins,
      recent: usersRecent,
    },
    services: {
      total: servicesTotal,
      published: servicesPublished,
      unpublished: servicesUnpublished,
      recent: servicesRecent,
    },
    staff: {
      total: staffTotal,
      active: staffActive,
      inactive: staffInactive,
      recent: staffRecent,
    },
    favorites: {
      total: favoritesTotal,
    },
    recentActivity: {
      usersToday: usersToday,
      servicesToday: servicesToday,
      staffToday: staffToday,
    },
  };
}
