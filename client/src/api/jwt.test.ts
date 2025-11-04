/**
 * @author Bob's Garage Team
 * @purpose Unit tests for JWT decoding utilities
 * @version 1.0.0
 */

import { describe, it, expect } from "vitest";
import { decodeJwt } from "./jwt";

/**
 * Helper to create a mock JWT token
 */
function createMockJwt(payload: Record<string, unknown>): string {
	const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
	const payloadPart = btoa(JSON.stringify(payload))
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=/g, "");
	const signature = "mock-signature";
	return `${header}.${payloadPart}.${signature}`;
}

describe("decodeJwt", () => {
	it("should decode a valid JWT token", () => {
		const payload = { sub: 123, role: "admin", email: "test@example.com" };
		const token = createMockJwt(payload);

		const decoded = decodeJwt(token);

		expect(decoded).not.toBeNull();
		expect(decoded?.sub).toBe(123);
		expect(decoded?.role).toBe("admin");
		expect(decoded?.email).toBe("test@example.com");
	});

	it("should decode JWT with custom type", () => {
		interface CustomPayload {
			userId: number;
			name: string;
		}

		const payload = { userId: 456, name: "John Doe" };
		const token = createMockJwt(payload);

		const decoded = decodeJwt<CustomPayload>(token);

		expect(decoded).not.toBeNull();
		expect(decoded?.userId).toBe(456);
		expect(decoded?.name).toBe("John Doe");
	});

	it("should decode JWT with exp and iat claims", () => {
		const now = Math.floor(Date.now() / 1000);
		const payload = { sub: 789, exp: now + 3600, iat: now };
		const token = createMockJwt(payload);

		const decoded = decodeJwt(token);

		expect(decoded).not.toBeNull();
		expect(decoded?.sub).toBe(789);
		expect(decoded?.exp).toBeGreaterThan(now);
		expect(decoded?.iat).toBe(now);
	});

	it("should return null for invalid token format (not 3 parts)", () => {
		expect(decodeJwt("invalid")).toBeNull();
		expect(decodeJwt("part1.part2")).toBeNull();
		expect(decodeJwt("part1.part2.part3.part4")).toBeNull();
		expect(decodeJwt("")).toBeNull();
	});

	it("should return null for token with invalid base64 payload", () => {
		const invalidToken = "header.invalid-base64!!!.signature";
		expect(decodeJwt(invalidToken)).toBeNull();
	});

	it("should return null for token with invalid JSON payload", () => {
		const invalidJson = btoa("not-valid-json").replace(/\+/g, "-").replace(/\//g, "_");
		const invalidToken = `header.${invalidJson}.signature`;
		expect(decodeJwt(invalidToken)).toBeNull();
	});

	it("should handle token with URL-safe base64 encoding", () => {
		// Test with actual base64 that includes + and / characters
		const payload = { sub: 999, data: "test+data/test" };
		const token = createMockJwt(payload);

		const decoded = decodeJwt(token);

		expect(decoded).not.toBeNull();
		expect(decoded?.sub).toBe(999);
	});

	it("should handle empty payload object", () => {
		const payload = {};
		const token = createMockJwt(payload);

		const decoded = decodeJwt(token);

		expect(decoded).not.toBeNull();
		expect(typeof decoded).toBe("object");
	});

	it("should handle payload with nested objects", () => {
		const payload = {
			sub: 100,
			metadata: { role: "admin", permissions: ["read", "write"] },
		};
		const token = createMockJwt(payload);

		const decoded = decodeJwt<{ sub: number; metadata: { role: string; permissions: string[] } }>(
			token,
		);

		expect(decoded).not.toBeNull();
		expect(decoded?.metadata?.role).toBe("admin");
		expect(decoded?.metadata?.permissions).toEqual(["read", "write"]);
	});

	it("should return null for malformed token with special characters", () => {
		const malformedToken = "header.part.with.dots.in.payload.signature";
		expect(decodeJwt(malformedToken)).toBeNull();
	});
});
