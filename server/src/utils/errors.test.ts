/**
 * @author Bob's Garage Team
 * @purpose Unit tests for error handling utilities
 * @version 1.0.0
 */

import type { Response } from "express";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
	handleControllerError,
	isUniqueConstraintError,
} from "./errors.js";

describe("isUniqueConstraintError", () => {
	it("should return true for SequelizeUniqueConstraintError", () => {
		const error = { name: "SequelizeUniqueConstraintError" };
		expect(isUniqueConstraintError(error)).toBe(true);
	});

	it("should return false for other errors", () => {
		const error = { name: "SomeOtherError" };
		expect(isUniqueConstraintError(error)).toBe(false);
	});

	it("should return false for Error objects", () => {
		const error = new Error("Some error");
		expect(isUniqueConstraintError(error)).toBe(false);
	});

	it("should return false for null", () => {
		expect(isUniqueConstraintError(null)).toBe(false);
	});

	it("should return false for undefined", () => {
		expect(isUniqueConstraintError(undefined)).toBe(false);
	});

	it("should return false for primitives", () => {
		expect(isUniqueConstraintError("string")).toBe(false);
		expect(isUniqueConstraintError(123)).toBe(false);
	});

	it("should return false for objects without name property", () => {
		const error = { message: "Some error" };
		expect(isUniqueConstraintError(error)).toBe(false);
	});
});

describe("handleControllerError", () => {
	let mockRes: Partial<Response>;
	let originalEnv: string | undefined;

	beforeEach(() => {
		mockRes = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
		};
		originalEnv = process.env.NODE_ENV;
	});

	afterEach(() => {
		process.env.NODE_ENV = originalEnv;
		vi.clearAllMocks();
	});

	it("should handle Zod validation errors", () => {
		const schema = z.object({ email: z.string().email() });
		const result = schema.safeParse({ email: "invalid" });

		if (!result.success) {
			const handled = handleControllerError(result.error, mockRes as Response);

			expect(handled).toBe(true);
			expect(mockRes.status).toHaveBeenCalledWith(400);
			expect(mockRes.json).toHaveBeenCalledWith({
				message: "Validation error",
				errors: result.error.issues,
			});
		}
	});

	it("should handle Sequelize unique constraint errors", () => {
		const error = { name: "SequelizeUniqueConstraintError" };
		const handled = handleControllerError(error, mockRes as Response);

		expect(handled).toBe(true);
		expect(mockRes.status).toHaveBeenCalledWith(409);
		expect(mockRes.json).toHaveBeenCalledWith({
			message: "Duplicate entry",
		});
	});

	it("should use custom message for unique constraint errors", () => {
		const error = { name: "SequelizeUniqueConstraintError" };
		const handled = handleControllerError(error, mockRes as Response, {
			uniqueConstraintMessage: "Email already exists",
		});

		expect(handled).toBe(true);
		expect(mockRes.json).toHaveBeenCalledWith({
			message: "Email already exists",
		});
	});

	it("should handle generic errors in production", () => {
		process.env.NODE_ENV = "production";

		const error = new Error("Some error");
		const handled = handleControllerError(error, mockRes as Response);

		expect(handled).toBe(true);
		expect(mockRes.status).toHaveBeenCalledWith(500);
		expect(mockRes.json).toHaveBeenCalledWith({
			message: "Internal server error",
		});
		// Logger is mocked, so we just verify the error was handled correctly
	});

	it("should include error details in development mode", () => {
		process.env.NODE_ENV = "development";
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const error = new Error("Development error");
		const handled = handleControllerError(error, mockRes as Response, {
			developmentErrorDetails: true,
		});

		expect(handled).toBe(true);
		expect(mockRes.status).toHaveBeenCalledWith(500);
		expect(mockRes.json).toHaveBeenCalledWith({
			message: "Internal server error",
			error: "Development error",
		});

		consoleSpy.mockRestore();
	});

	it("should not include error details when developmentErrorDetails is false", () => {
		process.env.NODE_ENV = "development";
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const error = new Error("Some error");
		const handled = handleControllerError(error, mockRes as Response, {
			developmentErrorDetails: false,
		});

		expect(handled).toBe(true);
		expect(mockRes.json).toHaveBeenCalledWith({
			message: "Internal server error",
		});

		consoleSpy.mockRestore();
	});

	it("should handle non-Error objects", () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const error = { message: "String error" };
		const handled = handleControllerError(error, mockRes as Response);

		expect(handled).toBe(true);
		expect(mockRes.status).toHaveBeenCalledWith(500);

		consoleSpy.mockRestore();
	});
});
