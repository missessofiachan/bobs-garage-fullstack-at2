/**
 * @file errorFormatter.ts
 * @author Bob's Garage Team
 * @description Utility functions to format error messages for user-friendly display
 * @version 1.0.0
 */

import { AxiosError } from "axios";

/**
 * Formats an error into a user-friendly message
 */
export function formatErrorMessage(error: unknown): string {
	// Handle Axios errors
	if (error instanceof AxiosError) {
		const status = error.response?.status;
		const data = error.response?.data;

		// Handle 429 Too Many Requests with friendly message
		if (status === 429) {
			// Check if server provided a custom message
			if (data?.message && typeof data.message === "string") {
				return data.message;
			}
			// Default friendly message
			return "You're making requests too quickly. Please slow down and try again in a moment.";
		}

		// Handle other HTTP errors with server-provided messages
		if (data?.message && typeof data.message === "string") {
			return data.message;
		}

		// Handle validation errors (Zod-style)
		if (data?.errors && Array.isArray(data.errors)) {
			const messages = data.errors
				.map((issue: any) => {
					if (issue.message) return issue.message;
					const field = issue.path?.join(".") || "field";
					return `${field}: Invalid value`;
				})
				.filter(Boolean);
			if (messages.length > 0) {
				return messages.join(". ");
			}
		}

		// Handle network errors
		if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
			return "Request timed out. Please check your connection and try again.";
		}

		if (error.code === "ERR_NETWORK" || error.message.includes("Network")) {
			return "Network error. Please check your connection and try again.";
		}

		// Generic HTTP error
		if (status) {
			return `Request failed with status ${status}. Please try again.`;
		}
	}

	// Handle Error objects
	if (error instanceof Error) {
		return error.message;
	}

	// Handle string errors
	if (typeof error === "string") {
		return error;
	}

	// Fallback
	return "An unexpected error occurred. Please try again.";
}

