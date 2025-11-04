/**
 * @file axios.ts
 * @author Bob's Garage Team
 * @description Axios HTTP client configuration with request/response interceptors for automatic JWT token
 *              attachment and proactive token refresh. Handles authentication state and error responses.
 * @version 1.0.0
 * @since 1.0.0
 */

import axios, { AxiosError } from "axios";
import type {
	AxiosInstance,
	AxiosRequestConfig,
	InternalAxiosRequestConfig,
	AxiosRequestHeaders,
} from "axios";

// Base URL: configure via Vite env, fallback to local dev server
const BASE_URL = (import.meta as ImportMeta)?.env?.VITE_API_URL ?? "http://localhost:4000/api";

// In-memory access token (keep ephemeral, do not persist)
let accessToken: string | undefined;
export const getAccessToken = () => accessToken;
export const setAccessToken = (token?: string) => {
	accessToken = token;
};
export const clearAccessToken = () => {
	accessToken = undefined;
};

// Helper to check if token is expired or about to expire (within 5 minutes)
function isTokenExpiringSoon(token: string): boolean {
	try {
		const payload = JSON.parse(atob(token.split(".")[1]));
		if (!payload.exp) return true;
		const expirationTime = payload.exp * 1000;
		const now = Date.now();
		const fiveMinutes = 5 * 60 * 1000;
		// Return true if token expires within 5 minutes
		return expirationTime - now < fiveMinutes;
	} catch {
		return true;
	}
}

// Create the main axios instance for app API calls
export const api: AxiosInstance = axios.create({
	baseURL: BASE_URL,
	withCredentials: true, // needed so browser sends refresh cookie to /auth/refresh
	timeout: 15000,
});

// Plain axios for internal refresh/retry calls (no interceptors to avoid recursion)
const plain: AxiosInstance = axios.create({
	baseURL: BASE_URL,
	withCredentials: true,
	timeout: 15000,
});

// Flag fields on config to prevent infinite loops
type RetriesConfig = InternalAxiosRequestConfig & {
	_retry401?: boolean;
	_retry429Count?: number;
};

// Single-flight refresh handling
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
	if (!refreshPromise) {
		refreshPromise = (async () => {
			// POST /auth/refresh uses the HttpOnly cookie; no body required
			const { data } = await plain.post<{ access: string }>("/auth/refresh");
			setAccessToken(data.access);
			return data.access;
		})().finally(() => {
			refreshPromise = null;
		});
	}
	return refreshPromise;
}

// Helper: wait ms
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Attach Authorization header when token is present
// Also proactively refresh tokens that are about to expire
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
	const token = getAccessToken();
	if (token) {
		// Proactively refresh token if it's expiring soon (within 5 minutes)
		// Skip refresh for the refresh endpoint itself to avoid infinite loops
		const isRefreshEndpoint = config.url?.includes("/auth/refresh");
		if (!isRefreshEndpoint && isTokenExpiringSoon(token)) {
			try {
				const newToken = await refreshAccessToken();
				const headers: AxiosRequestHeaders = (config.headers ?? {}) as AxiosRequestHeaders;
				headers.Authorization = `Bearer ${newToken}`;
				config.headers = headers;
				return config;
			} catch {
				// If proactive refresh fails, use existing token and let 401 handler deal with it
				// Don't clear token here as the 401 handler will handle logout
			}
		}

		const headers: AxiosRequestHeaders = (config.headers ?? {}) as AxiosRequestHeaders;
		if (!headers.Authorization) {
			headers.Authorization = `Bearer ${token}`;
		}
		config.headers = headers;
	}
	return config;
});

// Response interceptor to handle 401 refresh and limited 429 retries
api.interceptors.response.use(
	(res) => res,
	async (error: AxiosError) => {
		const response = error.response;
		const original = error.config as RetriesConfig | undefined;

		// No config to retry
		if (!original) throw error;

		const status = response?.status;
		const isRefreshCall = original.url?.includes("/auth/refresh");

		// 401 Unauthorized: try to refresh access token once and retry original request
		if (status === 401 && !original._retry401 && !isRefreshCall) {
			original._retry401 = true;
			try {
				const newAccess = await refreshAccessToken();
				// Re-attach updated token
				const headers: AxiosRequestHeaders = (original.headers ?? {}) as AxiosRequestHeaders;
				headers.Authorization = `Bearer ${newAccess}`;
				original.headers = headers;
				return api.request(original as AxiosRequestConfig);
			} catch {
				// Refresh failed; clear token and propagate 401
				clearAccessToken();
				throw error;
			}
		}

		// 429 Too Many Requests: back off once using headers if present
		if (status === 429) {
			const count = original._retry429Count ?? 0;
			if (count < 1) {
				original._retry429Count = count + 1;
				const retryAfterHeader = response?.headers?.["retry-after"];
				const rateResetHeader = response?.headers?.["ratelimit-reset"] as unknown as
					| string
					| undefined;
				let delayMs = 1000;
				if (retryAfterHeader) {
					const v = Number(retryAfterHeader);
					if (Number.isFinite(v)) delayMs = Math.min(5000, Math.max(500, v * 1000));
				} else if (rateResetHeader) {
					const now = Date.now();
					const resetSec = Number(rateResetHeader);
					if (Number.isFinite(resetSec)) {
						const target = resetSec * 1000;
						delayMs = Math.min(5000, Math.max(500, target - now));
					}
				}
				await sleep(delayMs);
				return api.request(original as AxiosRequestConfig);
			}
		}

		throw error;
	},
);

export default api;
