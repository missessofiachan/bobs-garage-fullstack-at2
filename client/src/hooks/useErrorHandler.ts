/**
 * @author Bob's Garage Team
 * @purpose Hook for consistent error handling across the application
 * @version 1.0.0
 */

import { useCallback } from 'react';
import { useToast } from '../components/ui/ToastProvider';
import { extractFieldErrors, formatErrorMessageWithId } from '../utils/errorFormatter';

interface UseErrorHandlerOptions {
  /**
   * Optional callback to set a general error message
   */
  setError?: (message: string) => void;
  /**
   * Optional callback to set field-specific errors
   */
  setFieldErrors?: (errors: Record<string, string>) => void;
  /**
   * Whether to show a toast notification (default: true)
   */
  showToast?: boolean;
}

/**
 * Hook that provides consistent error handling across the application
 * Handles error formatting, toast notifications, and field error extraction
 */
export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { notify } = useToast();
  const { setError, setFieldErrors, showToast = true } = options;

  return useCallback(
    (error: unknown) => {
      const { message, requestId } = formatErrorMessageWithId(error);

      // Set general error if callback provided
      if (setError) {
        setError(message);
      }

      // Extract and set field errors if callback provided
      if (setFieldErrors) {
        const fieldErrors = extractFieldErrors(error);
        setFieldErrors(fieldErrors);
      }

      // Show toast notification
      if (showToast) {
        notify({
          body: message,
          variant: 'danger',
          requestId,
        });
      }

      return {
        message,
        requestId,
        fieldErrors: setFieldErrors ? extractFieldErrors(error) : undefined,
      };
    },
    [notify, setError, setFieldErrors, showToast]
  );
}
