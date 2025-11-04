/**
 * @author Bob's Garage Team
 * @purpose Unit tests for response utilities
 * @version 1.0.0
 */

import { describe, expect, it } from "vitest";
import { type ApiError, type ApiSuccess, err, ok } from "./responses.js";

describe("ok", () => {
	it("should create success response with data", () => {
		const response = ok({ id: 1, name: "Test" });

		expect(response).toEqual({
			success: true,
			data: { id: 1, name: "Test" },
			error: null,
		});
	});

	it("should include meta when provided", () => {
		const response = ok({ id: 1 }, { page: 1, limit: 10 });

		expect(response).toEqual({
			success: true,
			data: { id: 1 },
			error: null,
			meta: { page: 1, limit: 10 },
		});
	});

	it("should not include meta when not provided", () => {
		const response = ok({ id: 1 });

		expect(response).not.toHaveProperty("meta");
	});

	it("should handle null data", () => {
		const response = ok(null);

		expect(response).toEqual({
			success: true,
			data: null,
			error: null,
		});
	});

	it("should handle array data", () => {
		const response = ok([1, 2, 3]);

		expect(response).toEqual({
			success: true,
			data: [1, 2, 3],
			error: null,
		});
	});

	it("should have correct type signature", () => {
		const response: ApiSuccess<{ id: number }> = ok({ id: 1 });

		expect(response.success).toBe(true);
		expect(response.data.id).toBe(1);
		expect(response.error).toBeNull();
	});

	it("should handle complex meta object", () => {
		const response = ok(
			{ id: 1 },
			{
				pagination: { page: 1, total: 100 },
				timestamp: "2024-01-01",
			},
		);

		expect(response.meta).toEqual({
			pagination: { page: 1, total: 100 },
			timestamp: "2024-01-01",
		});
	});
});

describe("err", () => {
	it("should create error response", () => {
		const response = err("VALIDATION_ERROR", "Invalid input");

		expect(response).toEqual({
			success: false,
			data: null,
			error: {
				code: "VALIDATION_ERROR",
				message: "Invalid input",
			},
		});
	});

	it("should handle different error codes", () => {
		const response = err("NOT_FOUND", "Resource not found");

		expect(response.error.code).toBe("NOT_FOUND");
		expect(response.error.message).toBe("Resource not found");
	});

	it("should have correct type signature", () => {
		const response: ApiError = err("ERROR", "Something went wrong");

		expect(response.success).toBe(false);
		expect(response.data).toBeNull();
		expect(response.error.code).toBe("ERROR");
		expect(response.error.message).toBe("Something went wrong");
	});

	it("should handle empty error message", () => {
		const response = err("ERROR", "");

		expect(response.error.message).toBe("");
	});

	it("should handle long error messages", () => {
		const longMessage = "A".repeat(1000);
		const response = err("ERROR", longMessage);

		expect(response.error.message).toBe(longMessage);
	});
});

describe("response types", () => {
	it("should have correct ApiSuccess structure", () => {
		const success: ApiSuccess<string> = {
			success: true,
			data: "test",
			error: null,
		};

		expect(success.success).toBe(true);
		expect(success.data).toBe("test");
		expect(success.error).toBeNull();
	});

	it("should have correct ApiError structure", () => {
		const error: ApiError = {
			success: false,
			data: null,
			error: {
				code: "TEST_ERROR",
				message: "Test message",
			},
		};

		expect(error.success).toBe(false);
		expect(error.data).toBeNull();
		expect(error.error.code).toBe("TEST_ERROR");
		expect(error.error.message).toBe("Test message");
	});
});
