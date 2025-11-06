/**
 * @file axios.ts
 * @author Bob's Garage Team
 * @description Axios HTTP client configuration with request/response interceptors for automatic JWT token
 *              attachment and proactive token refresh. Handles authentication state and error responses.
 * @version 1.0.0
 * @since 1.0.0
 */

import type {
	AxiosInstance,
	AxiosRequestConfig,
	AxiosRequestHeaders,
	InternalAxiosRequestConfig,
} from "axios";
import axios, { AxiosError } from "axios";
import { formatErrorMessage } from "../utils/errorFormatter";

/**
 * Get the API base URL for the current environment.
 *
 * Priority:
 * 1. VITE_API_URL environment variable (set at build time)
 * 2. Relative URL "/api" if in production and no env var set (same-origin deployment)
 * 3. Default to localhost for development
 *
 * Note: Vite embeds environment variables at BUILD TIME.
 * For production builds, create client/.env.production with:
 *   VITE_API_URL=https://api.yourdomain.com/api
 *
 * Or use relative URLs if frontend and backend are served from the same origin.
 */
function getBaseUrl(): string {
	const envUrl = (import.meta as ImportMeta)?.env?.VITE_API_URL;
	if (envUrl) {
		return envUrl;
	}

	// In production, if no env var is set, assume same-origin deployment
	// Use relative URL which will work if frontend and backend are on same domain
	if (import.meta.env.PROD) {
		return "/api";
	}

	// Development fallback
	return "http://localhost:4000/api";
}

const BASE_URL = getBaseUrl();

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
	(res) => {
		// Store request ID and response time from headers for debugging
		const requestId = res.headers["x-request-id"];
		const responseTime = res.headers["x-response-time"];
		if (requestId && import.meta.env.DEV) {
			// Store in response for access if needed
			(res as any).__requestId = requestId;
			(res as any).__responseTime = responseTime;
		}
		return res;
	},
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
			// If retry failed, enhance error with user-friendly message
			const friendlyMessage = formatErrorMessage(error);
			const enhancedError = new AxiosError(
				friendlyMessage,
				error.code,
				error.config,
				error.request,
				error.response,
			);
			enhancedError.response = error.response;
			throw enhancedError;
		}

		// Enhance error with user-friendly message for other errors too
		if (error.response) {
			const friendlyMessage = formatErrorMessage(error);
			if (friendlyMessage !== error.message) {
				const enhancedError = new AxiosError(
					friendlyMessage,
					error.code,
					error.config,
					error.request,
					error.response,
				);
				enhancedError.response = error.response;
				throw enhancedError;
			}
		}

		throw error;
	},
);

export default api;
