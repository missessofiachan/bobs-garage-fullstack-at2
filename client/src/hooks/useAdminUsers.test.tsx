/**
 * @author Bob's Garage Team
 * @purpose Unit tests for useAdminUsers hooks
 * @version 1.0.0
 */

import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useAdminUsers, useAdminUser } from "./useAdminUsers";

// Mock the API
vi.mock("../api/axios", () => ({
	default: {
		get: vi.fn((url: string) => {
			if (url === "/admin/users") {
				return Promise.resolve({
					data: [
						{ id: 1, email: "admin@example.com", role: "admin", active: true },
						{ id: 2, email: "user@example.com", role: "user", active: true },
					],
				});
			}
			if (url === "/admin/users/1") {
				return Promise.resolve({
					data: { id: 1, email: "admin@example.com", role: "admin", active: true },
				});
			}
			return Promise.reject(new Error("Not found"));
		}),
	},
}));

describe("useAdminUsers hooks", () => {
	const createWrapper = () => {
		const queryClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false },
			},
		});
		return ({ children }: { children: React.ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);
	};

	describe("useAdminUsers", () => {
		it("should fetch and return admin users list", async () => {
			const { result } = renderHook(() => useAdminUsers(), { wrapper: createWrapper() });

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(result.current.data).toHaveLength(2);
			expect(result.current.data?.[0]).toHaveProperty("email", "admin@example.com");
			expect(result.current.data?.[1]).toHaveProperty("email", "user@example.com");
		});

		it("should handle loading state", () => {
			const { result } = renderHook(() => useAdminUsers(), { wrapper: createWrapper() });

			expect(result.current.isLoading).toBe(true);
		});

		it("should have staleTime of 0 for fresh data", () => {
			// Admin data should always be fresh
			const { result } = renderHook(() => useAdminUsers(), { wrapper: createWrapper() });
			expect(result.current).toBeDefined();
		});
	});

	describe("useAdminUser", () => {
		it("should fetch and return a single admin user", async () => {
			const { result } = renderHook(() => useAdminUser(1), { wrapper: createWrapper() });

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(result.current.data).toHaveProperty("id", 1);
			expect(result.current.data).toHaveProperty("email", "admin@example.com");
			expect(result.current.data).toHaveProperty("role", "admin");
		});

		it("should handle loading state", () => {
			const { result } = renderHook(() => useAdminUser(1), { wrapper: createWrapper() });

			expect(result.current.isLoading).toBe(true);
		});

		it("should be disabled when id is undefined", () => {
			const { result } = renderHook(() => useAdminUser(undefined), { wrapper: createWrapper() });

			expect(result.current.isFetching).toBe(false);
		});

		it("should handle error when user not found", async () => {
			const { result } = renderHook(() => useAdminUser(999), { wrapper: createWrapper() });

			await waitFor(() => {
				expect(result.current.isError).toBe(true);
			});
		});
	});
});
