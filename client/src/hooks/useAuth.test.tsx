/**
 * @author Bob's Garage Team
 * @purpose Unit tests for useAuth hook
 * @version 1.0.0
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { useAuth } from "./useAuth";
import authReducer from "../slices/auth.slice";
import api, { setAccessToken, clearAccessToken } from "../api/axios";
import { decodeJwt } from "../api/jwt";

const mockPost = api.post as any;
const mockSetAccessToken = setAccessToken as any;
const mockClearAccessToken = clearAccessToken as any;
const mockDecodeJwt = decodeJwt as any;

// Mock axios
vi.mock("../api/axios", () => ({
	default: {
		post: vi.fn(),
	},
	setAccessToken: vi.fn(),
	clearAccessToken: vi.fn(),
}));

// Mock JWT decoding
vi.mock("../api/jwt", () => ({
	decodeJwt: vi.fn(),
}));

describe("useAuth", () => {
	const createStore = () => {
		return configureStore({
			reducer: {
				auth: authReducer,
			},
		});
	};

	const wrapper = ({ children }: { children: React.ReactNode }) => {
		const store = createStore();
		return <Provider store={store}>{children}</Provider>;
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("login", () => {
		it("should login successfully and set auth state", async () => {
			const mockToken = "mock-access-token";
			const mockPayload = { role: "admin" as const, email: "admin@example.com" };

			mockPost.mockResolvedValue({
				data: { access: mockToken },
			});
			mockDecodeJwt.mockReturnValue(mockPayload);

			const { result } = renderHook(() => useAuth(), { wrapper });

			await act(async () => {
				const loginResult = await result.current.login({
					email: "admin@example.com",
					password: "password123",
				});

				expect(loginResult.access).toBe(mockToken);
				expect(loginResult.role).toBe("admin");
				expect(loginResult.email).toBe("admin@example.com");
			});

			await waitFor(() => {
				expect(mockPost).toHaveBeenCalledWith("/auth/login", {
					email: "admin@example.com",
					password: "password123",
				});
				expect(mockDecodeJwt).toHaveBeenCalledWith(mockToken);
				expect(mockSetAccessToken).toHaveBeenCalledWith(mockToken);
			});
		});

		it("should handle login with user role", async () => {
			const mockToken = "user-token";
			const mockPayload = { role: "user" as const, email: "user@example.com" };

			mockPost.mockResolvedValue({
				data: { access: mockToken },
			});
			mockDecodeJwt.mockReturnValue(mockPayload);

			const { result } = renderHook(() => useAuth(), { wrapper });

			await act(async () => {
				await result.current.login({
					email: "user@example.com",
					password: "password123",
				});
			});

			await waitFor(() => {
				expect(mockDecodeJwt).toHaveBeenCalledWith(mockToken);
			});
		});

		it("should handle login failure", async () => {
			const error = new Error("Invalid credentials");
			mockPost.mockRejectedValue(error);

			const { result } = renderHook(() => useAuth(), { wrapper });

			await act(async () => {
				await expect(
					result.current.login({
						email: "wrong@example.com",
						password: "wrong",
					}),
				).rejects.toThrow("Invalid credentials");
			});

			expect(mockSetAccessToken).not.toHaveBeenCalled();
		});

		it("should handle JWT decode returning null", async () => {
			const mockToken = "valid-token";
			mockPost.mockResolvedValue({
				data: { access: mockToken },
			});
			mockDecodeJwt.mockReturnValue(null);

			const { result } = renderHook(() => useAuth(), { wrapper });

			await act(async () => {
				const loginResult = await result.current.login({
					email: "test@example.com",
					password: "password123",
				});

				expect(loginResult.access).toBe(mockToken);
				expect(loginResult.role).toBeUndefined();
				expect(loginResult.email).toBeUndefined();
			});

			expect(mockSetAccessToken).toHaveBeenCalledWith(mockToken);
		});
	});

	describe("register", () => {
		it("should register successfully", async () => {
			mockPost.mockResolvedValue({
				data: { id: 1, email: "new@example.com" },
			});

			const { result } = renderHook(() => useAuth(), { wrapper });

			await act(async () => {
				await result.current.register({
					email: "new@example.com",
					password: "password123",
				});
			});

			expect(mockPost).toHaveBeenCalledWith("/auth/register", {
				email: "new@example.com",
				password: "password123",
			});
		});

		it("should handle registration failure", async () => {
			const error = new Error("Email already exists");
			mockPost.mockRejectedValue(error);

			const { result } = renderHook(() => useAuth(), { wrapper });

			await act(async () => {
				await expect(
					result.current.register({
						email: "existing@example.com",
						password: "password123",
					}),
				).rejects.toThrow("Email already exists");
			});
		});
	});

	describe("refresh", () => {
		it("should refresh token successfully", async () => {
			const mockToken = "new-access-token";
			const mockPayload = { role: "admin" as const, email: "admin@example.com" };

			mockPost.mockResolvedValue({
				data: { access: mockToken },
			});
			mockDecodeJwt.mockReturnValue(mockPayload);

			const { result } = renderHook(() => useAuth(), { wrapper });

			await act(async () => {
				const newToken = await result.current.refresh();
				expect(newToken).toBe(mockToken);
			});

			await waitFor(() => {
				expect(mockPost).toHaveBeenCalledWith("/auth/refresh");
				expect(mockDecodeJwt).toHaveBeenCalledWith(mockToken);
				expect(mockSetAccessToken).toHaveBeenCalledWith(mockToken);
			});
		});

		it("should handle refresh failure", async () => {
			const error = new Error("Refresh token expired");
			mockPost.mockRejectedValue(error);

			const { result } = renderHook(() => useAuth(), { wrapper });

			await act(async () => {
				await expect(result.current.refresh()).rejects.toThrow("Refresh token expired");
			});

			expect(mockSetAccessToken).not.toHaveBeenCalled();
		});
	});

	describe("logout", () => {
		it("should clear access token and auth state", () => {
			const { result } = renderHook(() => useAuth(), { wrapper });

			act(() => {
				result.current.logout();
			});

			expect(mockClearAccessToken).toHaveBeenCalled();
			// Redux state cleared via dispatch (tested in integration)
		});
	});
});
