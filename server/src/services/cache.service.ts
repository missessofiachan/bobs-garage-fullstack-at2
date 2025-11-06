/**
 * @file cache.service.ts
 * @author Bob's Garage Team
 * @description Cache service with Redis and in-memory backend support
 * @version 1.0.0
 * @since 1.0.0
 */

import { Redis, type RedisOptions } from "ioredis";
import { env } from "../config/env.js";
import { winstonLogger } from "../config/winston.js";
import { recordCacheHit, recordCacheMiss } from "./metrics.service.js";

interface CacheBackend {
	get<T>(key: string): Promise<T | null>;
	set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
	del(key: string): Promise<void>;
	delPattern(pattern: string): Promise<void>;
	flush(): Promise<void>;
	disconnect(): Promise<void>;
}

/**
 * In-memory cache backend using Map
 */
class MemoryCacheBackend implements CacheBackend {
	private cache = new Map<string, { value: unknown; expiresAt: number }>();

	async get<T>(key: string): Promise<T | null> {
		const entry = this.cache.get(key);
		if (!entry) return null;

		if (entry.expiresAt < Date.now()) {
			this.cache.delete(key);
			return null;
		}

		return entry.value as T;
	}

	async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
		const expiresAt = Date.now() + ttlSeconds * 1000;
		this.cache.set(key, { value, expiresAt });
	}

	async del(key: string): Promise<void> {
		this.cache.delete(key);
	}

	async delPattern(pattern: string): Promise<void> {
		const regex = new RegExp(pattern.replace(/\*/g, ".*"));
		for (const key of this.cache.keys()) {
			if (regex.test(key)) {
				this.cache.delete(key);
			}
		}
	}

	async flush(): Promise<void> {
		this.cache.clear();
	}

	async disconnect(): Promise<void> {
		this.cache.clear();
	}
}

/**
 * Redis cache backend
 */
class RedisCacheBackend implements CacheBackend {
	private client: Redis;

	constructor() {
		const config: RedisOptions = {
			host: env.REDIS_HOST || "localhost",
			port: env.REDIS_PORT || 6379,
			db: env.REDIS_DB || 0,
			retryStrategy: (times) => {
				const delay = Math.min(times * 50, 2000);
				return delay;
			},
			maxRetriesPerRequest: 3,
		};

		if (env.REDIS_PASSWORD) {
			config.password = env.REDIS_PASSWORD;
		}

		if (env.REDIS_TLS) {
			config.tls = {};
		}

		this.client = new Redis(config);

		this.client.on("error", (err: Error) => {
			winstonLogger.error(`Redis error: ${err.message}`);
		});

		this.client.on("connect", () => {
			winstonLogger.info("Redis connected");
		});

		this.client.on("ready", () => {
			winstonLogger.info("Redis ready");
		});

		this.client.on("close", () => {
			winstonLogger.warn("Redis connection closed");
		});
	}

	async connect(): Promise<void> {
		// Redis client connects automatically, but we can verify connection
		try {
			await this.client.ping();
			winstonLogger.info("Redis connection verified");
		} catch (err) {
			winstonLogger.warn(`Redis connection failed: ${err}`);
			// Don't throw - allow app to continue with degraded caching
		}
	}

	async get<T>(key: string): Promise<T | null> {
		try {
			const value = await this.client.get(key);
			if (!value) return null;
			return JSON.parse(value) as T;
		} catch (err) {
			winstonLogger.error(`Redis get error: ${err}`);
			return null;
		}
	}

	async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
		try {
			const serialized = JSON.stringify(value);
			await this.client.setex(key, ttlSeconds, serialized);
		} catch (err) {
			winstonLogger.error(`Redis set error: ${err}`);
		}
	}

	async del(key: string): Promise<void> {
		try {
			await this.client.del(key);
		} catch (err) {
			winstonLogger.error(`Redis del error: ${err}`);
		}
	}

	async delPattern(pattern: string): Promise<void> {
		try {
			const keys = await this.client.keys(pattern);
			if (keys.length > 0) {
				await this.client.del(...keys);
			}
		} catch (err) {
			winstonLogger.error(`Redis delPattern error: ${err}`);
		}
	}

	async flush(): Promise<void> {
		try {
			await this.client.flushdb();
		} catch (err) {
			winstonLogger.error(`Redis flush error: ${err}`);
		}
	}

	async disconnect(): Promise<void> {
		try {
			await this.client.quit();
		} catch (err) {
			// Ignore errors during disconnect
			winstonLogger.warn(`Error disconnecting Redis: ${err}`);
		}
	}
}

/**
 * Cache service with automatic backend selection
 */
class CacheService {
	private backend: CacheBackend | null = null;
	private prefix: string;

	constructor() {
		this.prefix = env.REDIS_KEY_PREFIX || "bobs_garage:";

		if (!env.CACHE_ENABLED) {
			winstonLogger.info("Cache disabled via CACHE_ENABLED=false");
			return;
		}

		if (env.CACHE_TYPE === "redis") {
			if (!env.REDIS_HOST) {
				winstonLogger.warn("Redis cache selected but REDIS_HOST not set, falling back to memory cache");
				this.backend = new MemoryCacheBackend();
			} else {
				this.backend = new RedisCacheBackend();
				// Try to connect, but don't fail if Redis is unavailable
				if (this.backend instanceof RedisCacheBackend) {
					this.backend.connect().catch(() => {
						winstonLogger.warn("Redis connection failed, using degraded mode");
					});
				}
			}
		} else {
			this.backend = new MemoryCacheBackend();
			winstonLogger.info("Using in-memory cache");
		}
	}

	private getKey(key: string): string {
		return `${this.prefix}${key}`;
	}

	async get<T>(key: string): Promise<T | null> {
		if (!this.backend) return null;
		const value = await this.backend.get<T>(this.getKey(key));
		if (value !== null) {
			recordCacheHit(env.CACHE_TYPE);
		} else {
			recordCacheMiss(env.CACHE_TYPE);
		}
		return value;
	}

	async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
		if (!this.backend) return;
		const ttl = ttlSeconds ?? env.CACHE_TTL_SECONDS;
		await this.backend.set(this.getKey(key), value, ttl);
	}

	async del(key: string): Promise<void> {
		if (!this.backend) return;
		await this.backend.del(this.getKey(key));
	}

	/**
	 * Delete all keys matching a pattern (supports wildcards)
	 */
	async delPattern(pattern: string): Promise<void> {
		if (!this.backend) return;
		const fullPattern = this.getKey(pattern);
		await this.backend.delPattern(fullPattern);
	}

	/**
	 * Invalidate cache for a specific resource type
	 */
	async invalidateResource(type: string, id?: string | number): Promise<void> {
		if (!this.backend) return;

		const tasks: Promise<void>[] = [];
		if (typeof id !== "undefined") {
			tasks.push(this.del(`${type}:${id}`));
			tasks.push(this.del(`${type}:/${id}`));
		}

		tasks.push(this.delPattern(`${type}:list:*`));
		tasks.push(this.delPattern(`${type}:/*`));

		await Promise.all(tasks);
	}

	async flush(): Promise<void> {
		if (!this.backend) return;
		await this.backend.flush();
	}

	async disconnect(): Promise<void> {
		if (!this.backend) return;
		await this.backend.disconnect();
	}

	isEnabled(): boolean {
		return env.CACHE_ENABLED && this.backend !== null;
	}
}

export const cacheService = new CacheService();

export default cacheService;
