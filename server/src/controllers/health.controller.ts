/**
 * @file health.controller.ts
 * @author Bob's Garage Team
 * @description Enhanced health check endpoint with system status
 * @version 1.0.0
 * @since 1.0.0
 */

import type { Request, Response } from 'express';
import { env } from '../config/env.js';
import { sequelize } from '../config/sequelize.js';
import cacheService from '../services/cache.service.js';

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    database: {
      status: 'connected' | 'disconnected';
      responseTime?: number;
    };
    cache: {
      status: 'enabled' | 'disabled' | 'connected' | 'disconnected';
      type?: string;
      responseTime?: number;
    };
  };
  system: {
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu?: {
      usage: number;
    };
  };
}

/**
 * @route GET /health
 * @description Enhanced health check endpoint with system status
 * @access Public
 * @returns {Object} 200 - Health status with service details
 */
export async function healthCheck(_req: Request, res: Response): Promise<void> {
  const health: HealthCheckResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: { status: 'disconnected' },
      cache: { status: cacheService.isEnabled() ? 'enabled' : 'disabled' },
    },
    system: {
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        percentage: 0,
      },
    },
  };

  // Calculate memory percentage
  const memUsage = process.memoryUsage();
  health.system.memory.percentage = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);

  // Check database connection
  const dbStartTime = Date.now();
  try {
    await sequelize.authenticate();
    const dbResponseTime = Date.now() - dbStartTime;
    health.services.database = {
      status: 'connected',
      responseTime: dbResponseTime,
    };
  } catch (_err) {
    health.services.database.status = 'disconnected';
    health.status = 'unhealthy';
  }

  // Check cache connection if enabled
  if (cacheService.isEnabled()) {
    const cacheStartTime = Date.now();
    try {
      await cacheService.set('__health_check__', 'ok', 1);
      await cacheService.del('__health_check__');
      const cacheResponseTime = Date.now() - cacheStartTime;
      health.services.cache = {
        status: 'connected',
        type: env.CACHE_TYPE,
        responseTime: cacheResponseTime,
      };
    } catch (_err) {
      health.services.cache.status = 'disconnected';
      if (health.status === 'healthy') {
        health.status = 'degraded';
      }
    }
  }

  // Determine overall status
  const statusCode = health.status === 'unhealthy' ? 503 : 200;
  res.status(statusCode).json(health);
}
