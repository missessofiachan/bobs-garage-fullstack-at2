/**
 * @author Bob's Garage Team
 * @purpose Utility functions for sending standardized API responses
 * @version 1.0.0
 */

export type ApiSuccess<T> = {
	success: true;
	data: T;
	error: null;
	meta?: Record<string, unknown>;
};
export type ApiError = {
	success: false;
	data: null;
	error: { code: string; message: string };
};

export const ok = <T>(data: T, meta?: Record<string, unknown>): ApiSuccess<T> =>
	({
		success: true,
		data,
		error: null,
		...(meta ? { meta } : {}),
	}) as ApiSuccess<T>;
export const err = (code: string, message: string): ApiError => ({
	success: false,
	data: null,
	error: { code, message },
});
