/**
 * @author Bob's Garage Team
 * @purpose Unit tests for useStaff hooks
 * @version 1.0.0
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useStaff, useStaffList } from "./useStaff";

// Mock the API - must define inside factory due to hoisting
vi.mock("../api/axios", () => ({
	default: {
		get: vi.fn((url: string) => {
			if (url === "/staff") {
				return Promise.resolve({
					data: [
						{
							id: 1,
							name: "John Doe",
							role: "Mechanic",
							bio: "Expert mechanic",
							photoUrl: "",
							active: true,
						},
						{
							id: 2,
							name: "Jane Smith",
							role: "Manager",
							bio: "Service manager",
							photoUrl: "",
							active: true,
						},
					],
				});
			}
			if (url === "/staff/1") {
				return Promise.resolve({
					data: {
						id: 1,
						name: "John Doe",
						role: "Mechanic",
						bio: "Expert mechanic",
						photoUrl: "",
						active: true,
					},
				});
			}
			return Promise.reject(new Error("Not found"));
		}),
	},
}));

import api from "../api/axios";

const mockGet = api.get as any;

describe("useStaff hooks", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

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

	describe("useStaffList", () => {
		it("should fetch and return staff list", async () => {
			const { result } = renderHook(() => useStaffList(), { wrapper: createWrapper() });

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(result.current.data).toHaveLength(2);
			expect(result.current.data?.[0]).toHaveProperty("name", "John Doe");
			expect(result.current.data?.[1]).toHaveProperty("name", "Jane Smith");
		});

		it("should handle loading state", () => {
			const { result } = renderHook(() => useStaffList(), { wrapper: createWrapper() });

			expect(result.current.isLoading).toBe(true);
		});

		it("should handle error state", async () => {
			// Override the mock to return an error for this test
			mockGet.mockImplementationOnce(() => Promise.reject(new Error("Network error")));

			const { result } = renderHook(() => useStaffList(), { wrapper: createWrapper() });

			await waitFor(
				() => {
					expect(result.current.isError).toBe(true);
				},
				{ timeout: 3000 },
			);
		});
	});

	describe("useStaff", () => {
		it("should fetch and return a single staff member", async () => {
			const { result } = renderHook(() => useStaff(1), { wrapper: createWrapper() });

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(result.current.data).toHaveProperty("id", 1);
			expect(result.current.data).toHaveProperty("name", "John Doe");
			expect(result.current.data).toHaveProperty("role", "Mechanic");
		});

		it("should handle loading state", () => {
			const { result } = renderHook(() => useStaff(1), { wrapper: createWrapper() });

			expect(result.current.isLoading).toBe(true);
		});

		it("should be disabled when id is undefined", () => {
			const { result } = renderHook(() => useStaff(undefined), { wrapper: createWrapper() });

			expect(result.current.isFetching).toBe(false);
		});

		it("should handle error when staff not found", async () => {
			const { result } = renderHook(() => useStaff(999), { wrapper: createWrapper() });

			await waitFor(() => {
				expect(result.current.isError).toBe(true);
			});
		});
	});
});
