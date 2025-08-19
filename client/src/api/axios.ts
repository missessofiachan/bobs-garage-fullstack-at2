import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosRequestHeaders } from 'axios';

// Base URL: configure via Vite env, fallback to local dev server
const BASE_URL = (import.meta as ImportMeta)?.env?.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

// In-memory access token (keep ephemeral, do not persist)
let accessToken: string | undefined;
export const getAccessToken = () => accessToken;
export const setAccessToken = (token?: string) => { accessToken = token; };
export const clearAccessToken = () => { accessToken = undefined; };

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
			const { data } = await plain.post<{ access: string }>('/auth/refresh');
			setAccessToken(data.access);
			return data.access;
		})()
			.finally(() => { refreshPromise = null; });
	}
	return refreshPromise;
}

// Helper: wait ms
const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

// Attach Authorization header when token is present
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
	const token = getAccessToken();
	if (token) {
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
		const isRefreshCall = original.url?.includes('/auth/refresh');

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
				const retryAfterHeader = response?.headers?.['retry-after'];
				const rateResetHeader = response?.headers?.['ratelimit-reset'] as unknown as string | undefined;
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
	}
);

export default api;
