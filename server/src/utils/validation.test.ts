/**
 * @author Bob's Garage Team
 * @purpose Unit tests for validation utilities
 * @version 1.0.0
 */

import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getUserIdFromRequest, parseIdParam, validateIdParam } from "./validation.js";

describe("parseIdParam", () => {
	let mockReq: Partial<Request>;
	let mockRes: Partial<Response>;

	beforeEach(() => {
		mockRes = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
		};
	});

	it("should return number for valid ID", () => {
		mockReq = { params: { id: "123" } };

		const result = parseIdParam(mockReq as Request, mockRes as Response);

		expect(result).toBe(123);
		expect(mockRes.status).not.toHaveBeenCalled();
		expect(mockRes.json).not.toHaveBeenCalled();
	});

	it("should return number for zero", () => {
		mockReq = { params: { id: "0" } };

		const result = parseIdParam(mockReq as Request, mockRes as Response);

		expect(result).toBe(0);
	});

	it("should return null and send 400 for invalid ID (NaN)", () => {
		mockReq = { params: { id: "invalid" } };

		const result = parseIdParam(mockReq as Request, mockRes as Response);

		expect(result).toBeNull();
		expect(mockRes.status).toHaveBeenCalledWith(400);
		expect(mockRes.json).toHaveBeenCalledWith({ message: "Invalid id" });
	});

	it('should return 0 for empty string (Number("") = 0)', () => {
		mockReq = { params: { id: "" } };

		const result = parseIdParam(mockReq as Request, mockRes as Response);

		// Number('') returns 0, which is finite, so function returns 0
		expect(result).toBe(0);
		expect(mockRes.status).not.toHaveBeenCalled();
	});

	it("should return null and send 400 for undefined", () => {
		mockReq = { params: { id: undefined as unknown as string } };

		const result = parseIdParam(mockReq as Request, mockRes as Response);

		expect(result).toBeNull();
		expect(mockRes.status).toHaveBeenCalledWith(400);
	});

	it("should handle negative numbers", () => {
		mockReq = { params: { id: "-5" } };

		const result = parseIdParam(mockReq as Request, mockRes as Response);

		expect(result).toBe(-5);
	});

	it("should handle decimal numbers (returns decimal value)", () => {
		mockReq = { params: { id: "123.456" } };

		const result = parseIdParam(mockReq as Request, mockRes as Response);

		// Number('123.456') returns 123.456, which is finite
		expect(result).toBe(123.456);
	});

	it("should handle Infinity", () => {
		mockReq = { params: { id: "Infinity" } };

		const result = parseIdParam(mockReq as Request, mockRes as Response);

		expect(result).toBeNull();
		expect(mockRes.status).toHaveBeenCalledWith(400);
	});
});

describe("validateIdParam", () => {
	let mockReq: Partial<Request>;
	let mockRes: Partial<Response>;

	beforeEach(() => {
		mockRes = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
		};
	});

	it("should return number for valid ID", () => {
		mockReq = { params: { id: "456" } };

		const result = validateIdParam(mockReq as Request, mockRes as Response);

		expect(result).toBe(456);
		expect(mockRes.status).not.toHaveBeenCalled();
	});

	it("should return null and send 400 for invalid ID", () => {
		mockReq = { params: { id: "not-a-number" } };

		const result = validateIdParam(mockReq as Request, mockRes as Response);

		expect(result).toBeNull();
		expect(mockRes.status).toHaveBeenCalledWith(400);
		expect(mockRes.json).toHaveBeenCalledWith({ message: "Invalid id" });
	});
});

describe("getUserIdFromRequest", () => {
	it("should extract user ID from request", () => {
		const mockReq = {
			user: { sub: 789, role: "user" },
		} as any;

		const result = getUserIdFromRequest(mockReq);

		expect(result).toBe(789);
	});

	it("should return null when user is undefined", () => {
		const mockReq = {} as any;

		const result = getUserIdFromRequest(mockReq);

		expect(result).toBeNull();
	});

	it("should return null when user.sub is undefined", () => {
		const mockReq = {
			user: { role: "user" },
		} as any;

		const result = getUserIdFromRequest(mockReq);

		expect(result).toBeNull();
	});

	it("should return null when user.sub is not a number", () => {
		const mockReq = {
			user: { sub: "not-a-number" },
		} as any;

		const result = getUserIdFromRequest(mockReq);

		expect(result).toBeNull();
	});

	it("should handle zero user ID", () => {
		const mockReq = {
			user: { sub: 0 },
		} as any;

		const result = getUserIdFromRequest(mockReq);

		expect(result).toBeNull(); // Zero is falsy, so returns null
	});

	it("should handle string user ID that converts to number", () => {
		const mockReq = {
			user: { sub: "123" },
		} as any;

		const result = getUserIdFromRequest(mockReq);

		expect(result).toBe(123);
	});
});
