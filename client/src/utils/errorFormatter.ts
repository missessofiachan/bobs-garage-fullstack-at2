/**
 * @file errorFormatter.ts
 * @author Bob's Garage Team
 * @description Utility functions to format error messages for user-friendly display
 * @version 1.0.0
 */

import { AxiosError } from 'axios';

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
 * Helper: Extract response data from AxiosError (Law of Demeter)
 */
function getResponseData(error: AxiosError): unknown {
  return error.response?.data;
}

/**
 * Helper: Extract response headers from AxiosError (Law of Demeter)
 */
function getResponseHeaders(error: AxiosError): Record<string, unknown> | undefined {
  return error.response?.headers;
}

/**
 * Helper: Extract structured error from response data (Law of Demeter)
 */
function getStructuredError(data: unknown): StructuredError['error'] | undefined {
  if (data && typeof data === 'object' && 'error' in data) {
    return (data as StructuredError).error;
  }
  return undefined;
}

/**
 * Extract request ID from error response
 */
export function getRequestId(error: unknown): string | undefined {
  if (error instanceof AxiosError) {
    // Try to get from structured error response
    const data = getResponseData(error);
    const errorInfo = getStructuredError(data);
    if (errorInfo?.requestId) {
      return errorInfo.requestId;
    }
    // Try to get from response headers
    const headers = getResponseHeaders(error);
    const requestId = headers?.['x-request-id'];
    if (typeof requestId === 'string') {
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
    const data = getResponseData(error);
    const errorInfo = getStructuredError(data);
    return errorInfo?.code;
  }
  return undefined;
}

/**
 * Get error details from structured error response
 */
export function getErrorDetails(error: unknown): unknown {
  if (error instanceof AxiosError) {
    const data = getResponseData(error);
    const errorInfo = getStructuredError(data);
    return errorInfo?.details;
  }
  return undefined;
}

/**
 * User-friendly error messages based on error codes
 */
const ERROR_CODE_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: 'Please check your input and try again.',
  NOT_FOUND: 'The requested resource was not found.',
  UNAUTHORIZED: 'You need to be logged in to access this.',
  FORBIDDEN: "You don't have permission to perform this action.",
  CONFLICT: 'This action conflicts with existing data.',
  INTERNAL_ERROR: 'An internal error occurred. Please try again later.',
  DATABASE_ERROR: 'A database error occurred. Please try again.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please slow down and try again.',
};

/**
 * Helper: Extract response status from AxiosError (Law of Demeter)
 */
function getResponseStatus(error: AxiosError): number | undefined {
  return error.response?.status;
}

/**
 * Type guard: Check if an object has a string message property
 */
function isErrorWithMessage(obj: unknown): obj is { message: string } {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'message' in obj &&
    typeof (obj as { message: unknown }).message === 'string'
  );
}

/**
 * Formats an error into a user-friendly message
 */
export function formatErrorMessage(error: unknown): string {
  // Handle Axios errors
  if (error instanceof AxiosError) {
    const status = getResponseStatus(error);
    const data = getResponseData(error);

    // Handle structured error response (new format)
    const errorInfo = getStructuredError(data);
    if (errorInfo) {
      const errorCode = errorInfo.code;
      const errorMessage = errorInfo.message;

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
      if (isErrorWithMessage(data)) {
        return data.message;
      }
      // Default friendly message
      return "You're making requests too quickly. Please slow down and try again in a moment.";
    }

    // Handle other HTTP errors with server-provided messages
    if (isErrorWithMessage(data)) {
      return data.message;
    }

    // Handle validation errors (Zod-style)
    const validationErrors = getValidationErrors(data);
    if (validationErrors) {
      const messages = validationErrors
        .map((issue) => {
          if (issue.message) return issue.message;
          const field = issue.path?.join('.') || 'field';
          return `${field}: Invalid value`;
        })
        .filter(Boolean);
      if (messages.length > 0) {
        return messages.join('. ');
      }
    }

    // Handle network errors
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return 'Request timed out. Please check your connection and try again.';
    }

    if (error.code === 'ERR_NETWORK' || error.message.includes('Network')) {
      return 'Network error. Please check your connection and try again.';
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
  if (typeof error === 'string') {
    return error;
  }

  // Fallback
  return 'An unexpected error occurred. Please try again.';
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

interface ValidationIssue {
  path: string[];
  message: string;
}

/**
 * Helper: Extract validation errors from response data (Law of Demeter)
 */
function getValidationErrors(data: unknown): ValidationIssue[] | undefined {
  if (data && typeof data === 'object' && 'errors' in data) {
    const errors = (data as { errors: unknown }).errors;
    return Array.isArray(errors) ? errors : undefined;
  }
  return undefined;
}

function isAxiosErrorWithValidationErrors(
  error: unknown
): error is AxiosError<{ errors: ValidationIssue[] }> {
  if (error instanceof AxiosError) {
    const data = getResponseData(error);
    const errors = getValidationErrors(data);
    return Array.isArray(errors);
  }
  return false;
}

function isZodError(error: unknown): error is { issues: ValidationIssue[] } {
  return (
    error !== null &&
    typeof error === 'object' &&
    'issues' in error &&
    Array.isArray((error as { issues: unknown }).issues)
  );
}

function isValidationIssue(issue: unknown): issue is ValidationIssue {
  return (
    issue !== null &&
    typeof issue === 'object' &&
    'path' in issue &&
    Array.isArray((issue as { path: unknown }).path) &&
    'message' in issue &&
    typeof (issue as { message: unknown }).message === 'string'
  );
}

/**
 * Extract field-specific errors from validation error responses
 * Returns a record mapping field names to error messages
 */
export function extractFieldErrors(error: unknown): Record<string, string> {
  const errors: Record<string, string> = {};

  // Handle Axios errors with response.data.errors
  if (isAxiosErrorWithValidationErrors(error)) {
    const data = getResponseData(error);
    const validationErrors = getValidationErrors(data);
    if (validationErrors) {
      validationErrors.forEach((issue) => {
        if (isValidationIssue(issue)) {
          const field = issue.path[0] || 'general';
          errors[field] = issue.message;
        }
      });
    }
  }

  // Handle Zod validation errors (direct issues array)
  if (isZodError(error)) {
    error.issues.forEach((issue) => {
      if (isValidationIssue(issue)) {
        const field = issue.path[0] || 'general';
        errors[field] = issue.message;
      }
    });
  }

  return errors;
}
