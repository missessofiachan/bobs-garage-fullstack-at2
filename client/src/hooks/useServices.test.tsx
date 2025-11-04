/**
 * @author Bob's Garage Team
 * @purpose Unit tests for useServices hook
 * @version 1.0.0
 */

import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useServices } from "./useServices";

// Mock the API
vi.mock("../api/axios", () => ({
	default: {
		get: vi.fn((url: string) => {
			if (url === "/services") {
				return Promise.resolve({
					data: [
						{ id: 1, name: "Oil Change", price: 50, description: "Test", published: true },
						{ id: 2, name: "Brake Service", price: 150, description: "Test", published: true },
					],
				});
			}
			return Promise.reject(new Error("Not found"));
		}),
	},
}));

describe("useServices", () => {
	it("should fetch and return services list", async () => {
		const queryClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false },
			},
		});

		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);

		const { result } = renderHook(() => useServices(), { wrapper });

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		expect(result.current.data).toHaveLength(2);
		expect(result.current.data?.[0]).toHaveProperty("name", "Oil Change");
		expect(result.current.data?.[1]).toHaveProperty("name", "Brake Service");
	});

	it("should handle loading state", () => {
		const queryClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false },
			},
		});

		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);

		const { result } = renderHook(() => useServices(), { wrapper });

		expect(result.current.isLoading).toBe(true);
	});
});
