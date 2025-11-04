/**
 * @author Bob's Garage Team
 * @purpose API utility functions for consistent API base URL handling
 * @version 1.0.0
 */

/**
 * Get the base API URL without the /api suffix
 * Used for root-level endpoints like /health and /db-status
 */
export function getApiBaseUrl(): string {
	const apiUrl =
		(import.meta as ImportMeta)?.env?.VITE_API_URL ?? "http://localhost:4000/api";
	return apiUrl.replace(/\/api\/?$/, "");
}

/**
 * Get the full API URL with /api suffix
 * Used for API endpoints
 */
export function getApiUrl(): string {
	return (import.meta as ImportMeta)?.env?.VITE_API_URL ?? "http://localhost:4000/api";
}

/**
 * Get the base URL for constructing image URLs
 * Removes /api suffix if present
 */
export function getImageBaseUrl(): string {
	return getApiBaseUrl();
}
