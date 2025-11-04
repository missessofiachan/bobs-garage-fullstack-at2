/**
 * @author Bob's Garage Team
 * @purpose Generic form handling hook with validation and error management
 * @version 1.0.0
 */

import { useState, useCallback } from "react";
import { useToast } from "../components/ui/ToastProvider";

interface UseFormOptions<T> {
	onSubmit: (data: T) => Promise<void>;
	onSuccess?: () => void;
	successMessage?: string;
	defaultValues: T;
	validate?: (data: T) => { isValid: boolean; errors?: Record<string, string> };
}

/**
 * Generic form hook that handles state, loading, errors, and validation
 */
export function useForm<T extends Record<string, unknown>>(options: UseFormOptions<T>) {
	const [values, setValues] = useState<T>(options.defaultValues);
	const [error, setError] = useState<string>();
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState(false);
	const { notify } = useToast();

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			setError(undefined);
			setFieldErrors({});
			setLoading(true);

			try {
				// Run validation if provided
				if (options.validate) {
					const validation = options.validate(values);
					if (!validation.isValid && validation.errors) {
						setFieldErrors(validation.errors);
						setLoading(false);
						return;
					}
				}

				// Submit
				await options.onSubmit(values);

				// Success handling
				if (options.successMessage) {
					notify({
						title: "Success",
						body: options.successMessage,
						variant: "success",
					});
				}
				options.onSuccess?.();
			} catch (err) {
				const message = err instanceof Error ? err.message : "Operation failed";
				setError(message);
				notify({
					body: message,
					variant: "danger",
				});
			} finally {
				setLoading(false);
			}
		},
		[values, options, notify],
	);

	const setValue = useCallback((key: keyof T, value: unknown) => {
		setValues((prev) => ({ ...prev, [key]: value }));
	}, []);

	const setValues_ = useCallback((newValues: Partial<T>) => {
		setValues((prev) => ({ ...prev, ...newValues }));
	}, []);

	const reset = useCallback(() => {
		setValues(options.defaultValues);
		setError(undefined);
		setFieldErrors({});
	}, [options.defaultValues]);

	const setFieldError = useCallback((field: string, message: string) => {
		setFieldErrors((prev) => ({ ...prev, [field]: message }));
	}, []);

	return {
		values,
		error,
		fieldErrors,
		loading,
		handleSubmit,
		setValue,
		setValues: setValues_,
		reset,
		setFieldError,
	};
}

export default useForm;
