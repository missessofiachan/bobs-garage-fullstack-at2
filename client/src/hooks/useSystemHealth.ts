/**
 * @file useSystemHealth.ts
 * @author Bob's Garage Team
 * @description Hook to fetch enhanced system health status
 * @version 1.0.0
 * @since 1.0.0
 */

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getApiBaseUrl } from "../utils/api";

interface SystemHealth {
	status: "healthy" | "degraded" | "unhealthy";
	timestamp: string;
	uptime: number;
	version: string;
	services: {
		database: {
			status: "connected" | "disconnected";
			responseTime?: number;
		};
		cache: {
			status: "enabled" | "disabled" | "connected" | "disconnected";
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

export function useSystemHealth() {
	return useQuery<SystemHealth>({
		queryKey: ["system", "health"],
		queryFn: async () => {
			const baseUrl = getApiBaseUrl();
			const { data } = await axios.get<SystemHealth>(`${baseUrl}/health`, {
				timeout: 5000,
			});
			return data;
		},
		refetchInterval: 30000, // Refetch every 30 seconds
		staleTime: 10000, // Consider stale after 10 seconds
		retry: 1, // Only retry once on failure
	});
}
