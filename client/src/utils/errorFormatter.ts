/**
 * @file errorFormatter.ts
 * @author Bob's Garage Team
 * @description Utility functions to format error messages for user-friendly display
 * @version 1.0.0
 */

import { AxiosError } from "axios";

/**
 * Structured error response from backend
 */
export interface StructuredError {
	error: {
		code: string;
		message: string;
		requestId?: string;
		timestamp?: string;
		path?: string;
		details?: unknown;
	};
}

/**
 * Extract request ID from error response
 */
export function getRequestId(error: unknown): string | undefined {
	if (error instanceof AxiosError) {
		// Try to get from structured error response
		const data = error.response?.data as StructuredError | undefined;
		if (data?.error?.requestId) {
			return data.error.requestId;
		}
		// Try to get from response headers
		const requestId = error.response?.headers?.["x-request-id"];
		if (typeof requestId === "string") {
			return requestId;
		}
	}
	return undefined;
}

/**
 * Extract error code from structured error response
 */
export function getErrorCode(error: unknown): string | undefined {
	if (error instanceof AxiosError) {
		const data = error.response?.data as StructuredError | undefined;
		return data?.error?.code;
	}
	return undefined;
}

/**
 * Get error details from structured error response
 */
export function getErrorDetails(error: unknown): unknown {
	if (error instanceof AxiosError) {
		const data = error.response?.data as StructuredError | undefined;
		return data?.error?.details;
	}
	return undefined;
}

/**
 * User-friendly error messages based on error codes
 */
const ERROR_CODE_MESSAGES: Record<string, string> = {
	VALIDATION_ERROR: "Please check your input and try again.",
	NOT_FOUND: "The requested resource was not found.",
	UNAUTHORIZED: "You need to be logged in to access this.",
	FORBIDDEN: "You don't have permission to perform this action.",
	CONFLICT: "This action conflicts with existing data.",
	INTERNAL_ERROR: "An internal error occurred. Please try again later.",
	DATABASE_ERROR: "A database error occurred. Please try again.",
	RATE_LIMIT_EXCEEDED: "Too many requests. Please slow down and try again.",
};

/**
 * Formats an error into a user-friendly message
 */
export function formatErrorMessage(error: unknown): string {
	// Handle Axios errors
	if (error instanceof AxiosError) {
		const status = error.response?.status;
		const data = error.response?.data;

		// Handle structured error response (new format)
		if (data && typeof data === "object" && "error" in data) {
			const structuredError = data as StructuredError;
			const errorCode = structuredError.error.code;
			const errorMessage = structuredError.error.message;

			// Use code-based message if available, otherwise use provided message
			if (errorCode && ERROR_CODE_MESSAGES[errorCode]) {
				return ERROR_CODE_MESSAGES[errorCode];
			}
			if (errorMessage) {
				return errorMessage;
			}
		}

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

/**
 * Format error message with request ID for support/debugging
 */
export function formatErrorMessageWithId(error: unknown): {
	message: string;
	requestId?: string;
	errorCode?: string;
} {
	const message = formatErrorMessage(error);
	const requestId = getRequestId(error);
	const errorCode = getErrorCode(error);
	return { message, requestId, errorCode };
}
