/**
 * @author Bob's Garage Team
 * @purpose Unit tests for password hashing utilities
 * @version 1.0.0
 */

import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./hash.js";

describe("hashPassword", () => {
	it("should hash a password", async () => {
		const password = "testPassword123";
		const hash = await hashPassword(password);

		expect(hash).toBeDefined();
		expect(typeof hash).toBe("string");
		expect(hash.length).toBeGreaterThan(0);
	});

	it("should produce different hashes for the same password", async () => {
		const password = "samePassword";
		const hash1 = await hashPassword(password);
		const hash2 = await hashPassword(password);

		// bcrypt produces different hashes each time (due to salt)
		expect(hash1).not.toBe(hash2);
	});

	it("should produce valid bcrypt hashes", async () => {
		const password = "testPassword";
		const hash = await hashPassword(password);

		// Valid bcrypt hash starts with $2a$, $2b$, or $2y$ and has proper format
		expect(hash).toMatch(/^\$2[abxy]\$\d{2}\$/);
	});
});

describe("verifyPassword", () => {
	it("should return true for correct password", async () => {
		const password = "correctPassword123";
		const hash = await hashPassword(password);

		const isValid = await verifyPassword(password, hash);
		expect(isValid).toBe(true);
	});

	it("should return false for incorrect password", async () => {
		const correctPassword = "correctPassword123";
		const incorrectPassword = "wrongPassword456";
		const hash = await hashPassword(correctPassword);

		const isValid = await verifyPassword(incorrectPassword, hash);
		expect(isValid).toBe(false);
	});

	it("should return false for empty password", async () => {
		const password = "somePassword";
		const hash = await hashPassword(password);

		const isValid = await verifyPassword("", hash);
		expect(isValid).toBe(false);
	});

	it("should return false for invalid hash", async () => {
		const password = "testPassword";
		const invalidHash = "not_a_valid_hash";

		const isValid = await verifyPassword(password, invalidHash);
		expect(isValid).toBe(false);
	});

	it("should verify password after multiple hashes", async () => {
		const password = "testPassword";
		const hash1 = await hashPassword(password);
		const hash2 = await hashPassword(password);

		// Both hashes should verify the same password
		expect(await verifyPassword(password, hash1)).toBe(true);
		expect(await verifyPassword(password, hash2)).toBe(true);
	});
});
