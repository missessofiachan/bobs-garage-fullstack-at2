/**
 * @file cache.ts
 * @author Bob's Garage Team
 * @description Cache middleware for GET endpoints with configurable TTL
 * @version 1.0.0
 * @since 1.0.0
 */

import type { NextFunction, Request, Response } from "express";
import { cacheService } from "../services/cache.service.js";

/**
 * Generate a cache key from request
 */
function getCacheKey(req: Request): string {
	const path = req.path;
	const query = new URLSearchParams(req.query as Record<string, string>).toString();
	return query ? `${path}?${query}` : path;
}

/**
 * Middleware to cache GET responses
 * @param ttlSeconds - Cache TTL in seconds (default: 300)
 * @param keyPrefix - Optional prefix for cache key
 */
export function cacheMiddleware(ttlSeconds?: number, keyPrefix?: string) {
	return async (req: Request, res: Response, next: NextFunction) => {
		// Only cache GET requests
		if (req.method !== "GET" || !cacheService.isEnabled()) {
			return next();
		}

		// Skip caching for authenticated endpoints (user-specific data)
		if (req.user) {
			return next();
		}

		const cacheKey = keyPrefix ? `${keyPrefix}:${getCacheKey(req)}` : getCacheKey(req);

		// Try to get from cache
		const cached = await cacheService.get<{ body: unknown; headers: Record<string, string> }>(
			cacheKey,
		);

		if (cached) {
			// Set cached headers
			Object.entries(cached.headers).forEach(([key, value]) => {
				res.setHeader(key, value);
			});
			return res.status(200).json(cached.body);
		}

		// Store original json method
		const originalJson = res.json.bind(res);

		// Override json to capture response
		res.json = function (body: unknown) {
			// Store response headers that should be cached
			const headersToCache: Record<string, string> = {};
			const headers = ["content-type", "etag", "last-modified"];
			headers.forEach((header) => {
				const value = res.getHeader(header);
				if (value) {
					headersToCache[header] = String(value);
				}
			});

			// Cache the response
			cacheService.set(cacheKey, { body, headers: headersToCache }, ttlSeconds).catch(() => {
				// Silently fail if cache write fails
			});

			return originalJson(body);
		};

		next();
	};
}

/**
 * Helper to invalidate cache for a specific resource
 */
export async function invalidateCache(resourceType: string, id?: string | number): Promise<void> {
	await cacheService.invalidateResource(resourceType, id);
}
