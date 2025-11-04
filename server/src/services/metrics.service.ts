/**
 * @file metrics.service.ts
 * @author Bob's Garage Team
 * @description Prometheus metrics service for monitoring
 * @version 1.0.0
 * @since 1.0.0
 */

import client from "prom-client";
import cacheService from "./cache.service.js";

// Create a Registry to register the metrics
export const register = new client.Registry();

// Add default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// HTTP Request Metrics
export const httpRequestDuration = new client.Histogram({
	name: "http_request_duration_seconds",
	help: "Duration of HTTP requests in seconds",
	labelNames: ["method", "route", "status_code"],
	buckets: [0.1, 0.5, 1, 2, 5, 10],
	registers: [register],
});

export const httpRequestTotal = new client.Counter({
	name: "http_requests_total",
	help: "Total number of HTTP requests",
	labelNames: ["method", "route", "status_code"],
	registers: [register],
});

// Error Metrics
export const httpErrorsTotal = new client.Counter({
	name: "http_errors_total",
	help: "Total number of HTTP errors",
	labelNames: ["method", "route", "status_code"],
	registers: [register],
});

// Cache Metrics
export const cacheHits = new client.Counter({
	name: "cache_hits_total",
	help: "Total number of cache hits",
	labelNames: ["cache_type"],
	registers: [register],
});

export const cacheMisses = new client.Counter({
	name: "cache_misses_total",
	help: "Total number of cache misses",
	labelNames: ["cache_type"],
	registers: [register],
});

// Database Metrics
export const dbQueryDuration = new client.Histogram({
	name: "db_query_duration_seconds",
	help: "Duration of database queries in seconds",
	labelNames: ["operation", "table"],
	buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
	registers: [register],
});

export const dbQueryTotal = new client.Counter({
	name: "db_queries_total",
	help: "Total number of database queries",
	labelNames: ["operation", "table"],
	registers: [register],
});

// Track cache operations
let cacheHitCount = 0;
let cacheMissCount = 0;

export function recordCacheHit(cacheType: string = "memory"): void {
	cacheHits.inc({ cache_type: cacheType });
	cacheHitCount++;
}

export function recordCacheMiss(cacheType: string = "memory"): void {
	cacheMisses.inc({ cache_type: cacheType });
	cacheMissCount++;
}

export function getCacheHitRate(): number {
	const total = cacheHitCount + cacheMissCount;
	return total > 0 ? cacheHitCount / total : 0;
}

/**
 * Get metrics in Prometheus format
 */
export async function getMetrics(): Promise<string> {
	return register.metrics();
}
