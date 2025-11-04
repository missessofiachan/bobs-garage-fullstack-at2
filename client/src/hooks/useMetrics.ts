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
	system: {
		memory: {
			used: number;
			total: number;
		};
		cpu: number;
	};
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
		system: {
			memory: {
				used: 0,
				total: 0,
			},
			cpu: 0,
		},
	};

	for (const line of lines) {
		if (line.startsWith("#") || !line.trim()) continue;

		// Parse http_requests_total
		if (line.startsWith("http_requests_total")) {
			const match = line.match(/http_requests_total\{[^}]*status_code="(\d+)"[^}]*\} (\d+)/);
			if (match) {
				const status = match[1];
				const count = parseInt(match[2], 10);
				metrics.httpRequests.total += count;
				metrics.httpRequests.byStatus[status] =
					(metrics.httpRequests.byStatus[status] || 0) + count;
			}
		}

		// Parse http_errors_total
		if (line.startsWith("http_errors_total")) {
			const match = line.match(/http_errors_total\{[^}]*\} (\d+)/);
			if (match) {
				metrics.httpErrors += parseInt(match[1], 10);
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
