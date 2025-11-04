/**
 * @author Bob's Garage Team
 * @purpose Unit tests for auth service
 * @version 1.0.0
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { User } from "../db/models/User.js";
import { hashPassword, verifyPassword } from "../utils/hash.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { logger } from "../utils/logger.js";
import { loginUser, refreshAccessToken, registerUser } from "./auth.service.js";

// Mock dependencies
vi.mock("../db/models/User.js");
vi.mock("../utils/hash.js");
vi.mock("../utils/jwt.js");
vi.mock("../utils/logger.js", () => ({
	logger: {
		warn: vi.fn(),
		error: vi.fn(),
		info: vi.fn(),
	},
}));

const mockUserCreate = User.create as ReturnType<typeof vi.fn>;
const mockUserFindOne = User.findOne as ReturnType<typeof vi.fn>;
const mockHashPassword = hashPassword as ReturnType<typeof vi.fn>;
const mockVerifyPassword = verifyPassword as ReturnType<typeof vi.fn>;
const mockSignAccessToken = signAccessToken as ReturnType<typeof vi.fn>;
const mockSignRefreshToken = signRefreshToken as ReturnType<typeof vi.fn>;
const mockVerifyRefreshToken = verifyRefreshToken as ReturnType<typeof vi.fn>;

describe("auth.service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("registerUser", () => {
		it("should register a new user", async () => {
			const email = "test@example.com";
			const password = "password123";
			const hashedPassword = "hashed_password";
			const mockUser = {
				id: 1,
				email,
				passwordHash: hashedPassword,
				role: "user",
			};

			mockHashPassword.mockResolvedValue(hashedPassword);
			mockUserCreate.mockResolvedValue(mockUser);

			const result = await registerUser(email, password);

			expect(mockHashPassword).toHaveBeenCalledWith(password);
			expect(mockUserCreate).toHaveBeenCalledWith({
				email,
				passwordHash: hashedPassword,
				role: "user",
			});
			expect(result).toEqual({
				id: mockUser.id,
				email: mockUser.email,
			});
		});
	});

	describe("loginUser", () => {
		it("should return null for invalid email", async () => {
			mockUserFindOne.mockResolvedValue(null);

			const result = await loginUser("nonexistent@example.com", "password");

			expect(result).toBeNull();
			expect(mockVerifyPassword).not.toHaveBeenCalled();
		});

		it("should return null for invalid password", async () => {
			const mockUser = {
				id: 1,
				email: "test@example.com",
				passwordHash: "hashed_password",
				role: "user",
			};

			mockUserFindOne.mockResolvedValue(mockUser);
			mockVerifyPassword.mockResolvedValue(false);

			const result = await loginUser("test@example.com", "wrongpassword");

			expect(result).toBeNull();
			expect(mockVerifyPassword).toHaveBeenCalledWith("wrongpassword", mockUser.passwordHash);
		});

		it("should return tokens for valid credentials", async () => {
			const email = "test@example.com";
			const password = "password123";
			const mockUser = {
				id: 1,
				email,
				passwordHash: "hashed_password",
				role: "user",
			};
			const accessToken = "access_token";
			const refreshToken = "refresh_token";

			mockUserFindOne.mockResolvedValue(mockUser);
			mockVerifyPassword.mockResolvedValue(true);
			mockSignAccessToken.mockReturnValue(accessToken);
			mockSignRefreshToken.mockReturnValue(refreshToken);

			const result = await loginUser(email, password);

			expect(result).not.toBeNull();
			expect(result?.access).toBe(accessToken);
			expect(result?.refresh).toBe(refreshToken);
			expect(result?.user).toEqual({
				id: mockUser.id,
				email: mockUser.email,
				role: mockUser.role,
			});
			expect(mockSignAccessToken).toHaveBeenCalledWith({
				sub: mockUser.id,
				role: mockUser.role,
			});
			expect(mockSignRefreshToken).toHaveBeenCalledWith({
				sub: mockUser.id,
				role: mockUser.role,
			});
		});
	});

	describe("refreshAccessToken", () => {
		it("should return new access token for valid refresh token", async () => {
			const refreshToken = "valid_refresh_token";
			const newAccessToken = "new_access_token";
			const payload = { sub: 1, role: "user" };

			mockVerifyRefreshToken.mockReturnValue(payload);
			mockSignAccessToken.mockReturnValue(newAccessToken);

			const result = await refreshAccessToken(refreshToken);

			expect(result).toBe(newAccessToken);
			expect(mockVerifyRefreshToken).toHaveBeenCalledWith(refreshToken);
			expect(mockSignAccessToken).toHaveBeenCalledWith({
				sub: payload.sub,
				role: payload.role,
			});
		});

		it("should throw error for invalid refresh token", async () => {
			const refreshToken = "invalid_refresh_token";
			const error = new Error("Invalid token");

			mockVerifyRefreshToken.mockImplementation(() => {
				throw error;
			});

			await expect(refreshAccessToken(refreshToken)).rejects.toThrow(
				"Invalid or expired refresh token",
			);
			expect(mockVerifyRefreshToken).toHaveBeenCalledWith(refreshToken);
			expect(logger.warn).toHaveBeenCalledWith(
				expect.stringContaining("Failed to verify refresh token: Invalid token"),
			);
		});
	});
});
