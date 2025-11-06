/**
 * @file useMetrics.ts
 * @author Bob's Garage Team
 * @description Hook to fetch Prometheus metrics and parse them
 * @version 1.0.0
 * @since 1.0.0
 */

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getApiBaseUrl } from "../utils/api";

interface ParsedMetrics {
	httpRequests: {
		total: number;
		byStatus: Record<string, number>;
		byMethod: Record<string, number>;
	};
	httpErrors: number;
	httpRequestDuration: {
		average: number;
		p95: number;
		p99: number;
	};
	cache: {
		hits: number;
		misses: number;
		hitRate: number;
	};
	database: {
		totalQueries: number;
		byOperation: Record<string, number>;
		byTable: Record<string, number>;
		averageDuration: number;
		p95: number;
		p99: number;
		slowQueryCount: number; // Queries > 1 second
	};
	system: {
		memory: {
			used: number;
			total: number;
		};
		cpu: number;
	};
}

/**
 * Calculate percentile from histogram buckets
 */
function calculatePercentile(
	buckets: Array<{ le: string; count: number }>,
	total: number,
	percentile: number,
): number {
	if (total === 0) return 0;
	const target = total * (percentile / 100);

	for (let i = buckets.length - 1; i >= 0; i--) {
		if (buckets[i].count >= target) {
			return parseFloat(buckets[i].le);
		}
	}
	return parseFloat(buckets[buckets.length - 1]?.le || "0");
}

/**
 * Parse Prometheus metrics text format into structured data
 */
function parseMetrics(metricsText: string): ParsedMetrics {
	const lines = metricsText.split("\n");
	const metrics: ParsedMetrics = {
		httpRequests: {
			total: 0,
			byStatus: {},
			byMethod: {},
		},
		httpErrors: 0,
		httpRequestDuration: {
			average: 0,
			p95: 0,
			p99: 0,
		},
		cache: {
			hits: 0,
			misses: 0,
			hitRate: 0,
		},
		database: {
			totalQueries: 0,
			byOperation: {},
			byTable: {},
			averageDuration: 0,
			p95: 0,
			p99: 0,
			slowQueryCount: 0,
		},
		system: {
			memory: {
				used: 0,
				total: 0,
			},
			cpu: 0,
		},
	};

	// Track histogram data for percentiles
	const httpDurationBuckets: Array<{ le: string; count: number }> = [];
	const dbDurationBuckets: Array<{ le: string; count: number }> = [];
	let httpDurationSum = 0;
	let httpDurationCount = 0;
	let dbDurationSum = 0;
	let dbDurationCount = 0;

	for (const line of lines) {
		if (line.startsWith("#") || !line.trim()) continue;

		// Parse http_requests_total (with method and status)
		if (line.startsWith("http_requests_total")) {
			const match = line.match(/http_requests_total\{([^}]+)\} (\d+)/);
			if (match) {
				const labels = match[1];
				const count = parseInt(match[2], 10);
				metrics.httpRequests.total += count;

				// Extract status code
				const statusMatch = labels.match(/status_code="(\d+)"/);
				if (statusMatch) {
					const status = statusMatch[1];
					metrics.httpRequests.byStatus[status] =
						(metrics.httpRequests.byStatus[status] || 0) + count;
				}

				// Extract method
				const methodMatch = labels.match(/method="([^"]+)"/);
				if (methodMatch) {
					const method = methodMatch[1];
					metrics.httpRequests.byMethod[method] =
						(metrics.httpRequests.byMethod[method] || 0) + count;
				}
			}
		}

		// Parse http_request_duration_seconds histogram
		if (line.startsWith("http_request_duration_seconds_bucket")) {
			const match = line.match(
				/http_request_duration_seconds_bucket\{[^}]*le="([^"]+)"[^}]*\} (\d+)/,
			);
			if (match) {
				const le = match[1];
				const count = parseInt(match[2], 10);
				httpDurationBuckets.push({ le, count });
			}
		}
		if (line.startsWith("http_request_duration_seconds_sum")) {
			const match = line.match(/http_request_duration_seconds_sum\{[^}]*\} ([\d.]+)/);
			if (match) {
				httpDurationSum += parseFloat(match[1]);
			}
		}
		if (line.startsWith("http_request_duration_seconds_count")) {
			const match = line.match(/http_request_duration_seconds_count\{[^}]*\} (\d+)/);
			if (match) {
				httpDurationCount += parseInt(match[1], 10);
			}
		}

		// Parse http_errors_total
		if (line.startsWith("http_errors_total")) {
			const match = line.match(/http_errors_total\{[^}]*\} (\d+)/);
			if (match) {
				metrics.httpErrors += parseInt(match[1], 10);
			}
		}

		// Parse database query metrics
		if (line.startsWith("db_queries_total")) {
			const match = line.match(/db_queries_total\{([^}]+)\} (\d+)/);
			if (match) {
				const labels = match[1];
				const count = parseInt(match[2], 10);
				metrics.database.totalQueries += count;

				// Extract operation
				const operationMatch = labels.match(/operation="([^"]+)"/);
				if (operationMatch) {
					const operation = operationMatch[1];
					metrics.database.byOperation[operation] =
						(metrics.database.byOperation[operation] || 0) + count;
				}

				// Extract table
				const tableMatch = labels.match(/table="([^"]+)"/);
				if (tableMatch) {
					const table = tableMatch[1];
					metrics.database.byTable[table] = (metrics.database.byTable[table] || 0) + count;
				}
			}
		}

		// Parse db_query_duration_seconds histogram
		if (line.startsWith("db_query_duration_seconds_bucket")) {
			const match = line.match(/db_query_duration_seconds_bucket\{[^}]*le="([^"]+)"[^}]*\} (\d+)/);
			if (match) {
				const le = match[1];
				const count = parseInt(match[2], 10);
				dbDurationBuckets.push({ le, count });

				// Count slow queries (>1 second)
				if (parseFloat(le) >= 1.0) {
					metrics.database.slowQueryCount += count;
				}
			}
		}
		if (line.startsWith("db_query_duration_seconds_sum")) {
			const match = line.match(/db_query_duration_seconds_sum\{[^}]*\} ([\d.]+)/);
			if (match) {
				dbDurationSum += parseFloat(match[1]);
			}
		}
		if (line.startsWith("db_query_duration_seconds_count")) {
			const match = line.match(/db_query_duration_seconds_count\{[^}]*\} (\d+)/);
			if (match) {
				dbDurationCount += parseInt(match[1], 10);
			}
		}

		// Parse cache hits/misses
		if (line.startsWith("cache_hits_total")) {
			const match = line.match(/cache_hits_total\{[^}]*\} (\d+)/);
			if (match) {
				metrics.cache.hits += parseInt(match[1], 10);
			}
		}
		if (line.startsWith("cache_misses_total")) {
			const match = line.match(/cache_misses_total\{[^}]*\} (\d+)/);
			if (match) {
				metrics.cache.misses += parseInt(match[1], 10);
			}
		}

		// Parse system memory
		if (line.startsWith("process_resident_memory_bytes")) {
			const match = line.match(/process_resident_memory_bytes (\d+)/);
			if (match) {
				metrics.system.memory.used = parseInt(match[1], 10);
			}
		}
	}

	// Calculate HTTP response time percentiles
	if (httpDurationBuckets.length > 0 && httpDurationCount > 0) {
		// Sort buckets by le value (ascending)
		httpDurationBuckets.sort((a, b) => {
			if (a.le === "+Inf") return 1;
			if (b.le === "+Inf") return -1;
			return parseFloat(a.le) - parseFloat(b.le);
		});

		// Find the +Inf bucket for total count (or use the highest bucket)
		const totalBucket =
			httpDurationBuckets.find((b) => b.le === "+Inf") ||
			httpDurationBuckets[httpDurationBuckets.length - 1];
		const total = totalBucket?.count || httpDurationCount;

		metrics.httpRequestDuration.p95 = calculatePercentile(httpDurationBuckets, total, 95);
		metrics.httpRequestDuration.p99 = calculatePercentile(httpDurationBuckets, total, 99);
		metrics.httpRequestDuration.average = httpDurationSum / httpDurationCount;
	}

	// Calculate database query duration percentiles
	if (dbDurationBuckets.length > 0 && dbDurationCount > 0) {
		// Sort buckets by le value (ascending)
		dbDurationBuckets.sort((a, b) => {
			if (a.le === "+Inf") return 1;
			if (b.le === "+Inf") return -1;
			return parseFloat(a.le) - parseFloat(b.le);
		});

		// Find the +Inf bucket for total count
		const totalBucket =
			dbDurationBuckets.find((b) => b.le === "+Inf") ||
			dbDurationBuckets[dbDurationBuckets.length - 1];
		const total = totalBucket?.count || dbDurationCount;

		metrics.database.p95 = calculatePercentile(dbDurationBuckets, total, 95);
		metrics.database.p99 = calculatePercentile(dbDurationBuckets, total, 99);
		metrics.database.averageDuration = dbDurationSum / dbDurationCount;

		// Count slow queries: find the bucket with le >= 1.0
		const slowQueryBucket = dbDurationBuckets.find((b) => {
			if (b.le === "+Inf") return false;
			return parseFloat(b.le) >= 1.0;
		});
		if (slowQueryBucket) {
			// For slow queries, we want queries that took >= 1 second
			// Find the bucket just before 1.0 and subtract
			const beforeOneSecond = dbDurationBuckets.find((b) => {
				if (b.le === "+Inf") return false;
				return parseFloat(b.le) < 1.0;
			});
			const beforeCount = beforeOneSecond?.count || 0;
			metrics.database.slowQueryCount = slowQueryBucket.count - beforeCount;
		}
	}

	// Calculate cache hit rate
	const totalCacheOps = metrics.cache.hits + metrics.cache.misses;
	metrics.cache.hitRate = totalCacheOps > 0 ? metrics.cache.hits / totalCacheOps : 0;

	return metrics;
}

export function useMetrics() {
	return useQuery<ParsedMetrics>({
		queryKey: ["system", "metrics"],
		queryFn: async () => {
			const baseUrl = getApiBaseUrl();
			const { data } = await axios.get<string>(`${baseUrl}/metrics`, {
				headers: { Accept: "text/plain" },
				timeout: 5000,
			});
			return parseMetrics(data);
		},
		refetchInterval: 60000, // Refetch every minute
		staleTime: 30000, // Consider stale after 30 seconds
		retry: 1, // Only retry once on failure
	});
}
