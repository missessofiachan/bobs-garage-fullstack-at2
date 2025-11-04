/**
 * @file useConnectionStatus.ts
 * @author Bob's Garage Team
 * @description Hook to monitor API and database connection status with ping/latency using enhanced health check
 * @version 1.0.0
 */

import axios from "axios";
import { useEffect, useState } from "react";
import { getApiBaseUrl } from "../utils/api";

interface ConnectionStatus {
	api: "connected" | "disconnected" | "checking";
	db: "connected" | "disconnected" | "checking";
	apiPing: number | null;
	dbPing: number | null;
	responseTime?: string; // From X-Response-Time header
}

interface HealthResponse {
	status: "healthy" | "degraded" | "unhealthy";
	services: {
		database: {
			status: "connected" | "disconnected";
			responseTime?: number;
		};
	};
}

export function useConnectionStatus(intervalMs: number = 5000) {
	const [status, setStatus] = useState<ConnectionStatus>({
		api: "checking",
		db: "checking",
		apiPing: null,
		dbPing: null,
	});

	useEffect(() => {
		let mounted = true;

		const checkHealth = async () => {
			const baseUrl = getApiBaseUrl();

			// Check API health using enhanced health endpoint
			const apiStart = performance.now();
			try {
				const apiRes = await axios.get<HealthResponse>(`${baseUrl}/health`, {
					timeout: 3000,
				});
				const apiPing = Math.round(performance.now() - apiStart);
				const responseTime = apiRes.headers["x-response-time"] as string | undefined;

				if (mounted) {
					const isHealthy = apiRes.status === 200 && apiRes.data.status !== "unhealthy";
					setStatus((prev) => ({
						...prev,
						api: isHealthy ? "connected" : "disconnected",
						apiPing: isHealthy ? apiPing : null,
						responseTime,
					}));

					// Also update DB status from health response
					const dbStatus = apiRes.data.services?.database?.status;
					if (dbStatus) {
						setStatus((prev) => ({
							...prev,
							db: dbStatus === "connected" ? "connected" : "disconnected",
							dbPing:
								dbStatus === "connected" && apiRes.data.services.database.responseTime
									? apiRes.data.services.database.responseTime
									: null,
						}));
					}
				}
			} catch {
				if (mounted) {
					setStatus((prev) => ({
						...prev,
						api: "disconnected",
						apiPing: null,
						db: "disconnected",
						dbPing: null,
					}));
				}
			}
		};

		// Initial check
		checkHealth();

		// Set up interval
		const interval = setInterval(checkHealth, intervalMs);

		return () => {
			mounted = false;
			clearInterval(interval);
		};
	}, [intervalMs]);

	return status;
}
