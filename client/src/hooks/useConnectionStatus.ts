/**
 * @file useConnectionStatus.ts
 * @author Bob's Garage Team
 * @description Hook to monitor API and database connection status with ping/latency
 * @version 1.0.0
 */

import axios from "axios";
import { useEffect, useState } from "react";

interface ConnectionStatus {
	api: "connected" | "disconnected" | "checking";
	db: "connected" | "disconnected" | "checking";
	apiPing: number | null;
	dbPing: number | null;
}

import { getApiBaseUrl } from "../utils/api";

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

			// Check API health
			const apiStart = performance.now();
			try {
				const apiRes = await axios.get(`${baseUrl}/api/health`, { timeout: 3000 });
				const apiPing = Math.round(performance.now() - apiStart);
				if (mounted) {
					setStatus((prev) => ({
						...prev,
						api: apiRes.status === 200 ? "connected" : "disconnected",
						apiPing: apiRes.status === 200 ? apiPing : null,
					}));
				}
			} catch {
				if (mounted) {
					setStatus((prev) => ({
						...prev,
						api: "disconnected",
						apiPing: null,
					}));
				}
			}

			// Check DB status
			const dbStart = performance.now();
			try {
				const dbRes = await axios.get(`${baseUrl}/db-status`, { timeout: 3000 });
				const dbPing = Math.round(performance.now() - dbStart);
				if (mounted) {
					setStatus((prev) => ({
						...prev,
						db: dbRes.status === 200 ? "connected" : "disconnected",
						dbPing: dbRes.status === 200 ? dbPing : null,
					}));
				}
			} catch {
				if (mounted) {
					setStatus((prev) => ({
						...prev,
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
