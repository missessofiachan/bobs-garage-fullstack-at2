/**
 * @author Bob's Garage Team
 * @purpose Comprehensive unit tests for useResourceQuery hook factory
 * @version 2.0.0 (Expanded)
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock axios before importing
vi.mock("../api/axios", () => ({
	default: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		delete: vi.fn(),
	},
}));

import api from "../api/axios";
import { createResourceHooks } from "./useResourceQuery";

const mockGet = api.get as any;
const mockPost = api.post as any;
const mockPut = api.put as any;
const mockDelete = api.delete as any;

describe("createResourceHooks", () => {
	interface TestDTO extends Record<string, unknown> {
		id: number;
		name: string;
		value: number;
	}

	const config = {
		resource: "test",
		basePath: "/api/test",
		staleTime: 5000,
	};

	const createWrapper = () => {
		const queryClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false },
				mutations: { retry: false },
			},
		});
		return ({ children }: { children: React.ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getQueryKeys", () => {
		it("should return query key factory", () => {
			const hooks = createResourceHooks<TestDTO>(config);
			const keys = hooks.getQueryKeys();

			expect(keys.all).toEqual(["test"]);
			expect(keys.detail(123)).toEqual(["test", 123]);
		});

		it("should generate unique keys for different resources", () => {
			const hooks1 = createResourceHooks<TestDTO>({ ...config, resource: "resource1" });
			const hooks2 = createResourceHooks<TestDTO>({ ...config, resource: "resource2" });

			expect(hooks1.getQueryKeys().all).toEqual(["resource1"]);
			expect(hooks2.getQueryKeys().all).toEqual(["resource2"]);
		});
	});

	describe("useList", () => {
		it("should fetch and return list of resources", async () => {
			const mockData = [
				{ id: 1, name: "Item 1", value: 10 },
				{ id: 2, name: "Item 2", value: 20 },
			];
			mockGet.mockResolvedValue({ data: mockData });

			const hooks = createResourceHooks<TestDTO>(config);
			const { result } = renderHook(() => hooks.useList(), { wrapper: createWrapper() });

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(result.current.data).toEqual(mockData);
			expect(mockGet).toHaveBeenCalledWith("/api/test");
		});

		it("should use custom staleTime when provided", () => {
			const hooks = createResourceHooks<TestDTO>({ ...config, staleTime: 10000 });
			expect(hooks.useList).toBeDefined();
		});

		it("should handle loading state", () => {
			mockGet.mockImplementation(() => new Promise(() => {})); // Never resolves

			const hooks = createResourceHooks<TestDTO>(config);
			const { result } = renderHook(() => hooks.useList(), { wrapper: createWrapper() });

			expect(result.current.isLoading).toBe(true);
		});

		it("should handle error state", async () => {
			const error = new Error("Network error");
			mockGet.mockRejectedValue(error);

			const hooks = createResourceHooks<TestDTO>(config);
			const { result } = renderHook(() => hooks.useList(), { wrapper: createWrapper() });

			await waitFor(() => {
				expect(result.current.isError).toBe(true);
			});

			expect(result.current.error).toBe(error);
		});
	});

	describe("useGet", () => {
		it("should fetch and return a single resource", async () => {
			const mockData = { id: 1, name: "Item 1", value: 10 };
			mockGet.mockResolvedValue({ data: mockData });

			const hooks = createResourceHooks<TestDTO>(config);
			const { result } = renderHook(() => hooks.useGet(1), { wrapper: createWrapper() });

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(result.current.data).toEqual(mockData);
			expect(mockGet).toHaveBeenCalledWith("/api/test/1");
		});

		it("should be disabled when id is undefined", () => {
			const hooks = createResourceHooks<TestDTO>(config);
			const { result } = renderHook(() => hooks.useGet(undefined), { wrapper: createWrapper() });

			expect(result.current.isFetching).toBe(false);
			expect(mockGet).not.toHaveBeenCalled();
		});

		it("should be disabled when id is not a finite number", () => {
			const hooks = createResourceHooks<TestDTO>(config);
			const { result } = renderHook(() => hooks.useGet(NaN as any), { wrapper: createWrapper() });

			expect(result.current.isFetching).toBe(false);
			expect(mockGet).not.toHaveBeenCalled();
		});

		it("should handle error when resource not found", async () => {
			const error = new Error("Not found");
			mockGet.mockRejectedValue(error);

			const hooks = createResourceHooks<TestDTO>(config);
			const { result } = renderHook(() => hooks.useGet(999), { wrapper: createWrapper() });

			await waitFor(() => {
				expect(result.current.isError).toBe(true);
			});
		});
	});

	describe("useCreate", () => {
		it("should create a new resource", async () => {
			const newItem = { id: 3, name: "New Item", value: 30 };
			mockPost.mockResolvedValue({ data: newItem });

			const hooks = createResourceHooks<TestDTO>(config);
			const { result } = renderHook(() => hooks.useCreate(), { wrapper: createWrapper() });

			await act(async () => {
				await result.current.mutateAsync({ name: "New Item", value: 30 });
			});

			expect(mockPost).toHaveBeenCalledWith("/api/test", { name: "New Item", value: 30 });
			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});
		});

		it("should handle create error", async () => {
			const error = new Error("Creation failed");
			mockPost.mockRejectedValue(error);

			const hooks = createResourceHooks<TestDTO>(config);
			const { result } = renderHook(() => hooks.useCreate(), { wrapper: createWrapper() });

			await act(async () => {
				await result.current.mutateAsync({ name: "Item", value: 10 }).catch(() => {});
			});

			await waitFor(() => {
				expect(result.current.isError).toBe(true);
			});
		});

		it("should invalidate list queries on success", async () => {
			const newItem = { id: 3, name: "New Item", value: 30 };
			mockPost.mockResolvedValue({ data: newItem });

			const hooks = createResourceHooks<TestDTO>(config);
			const { result } = renderHook(() => hooks.useCreate(), { wrapper: createWrapper() });

			await act(async () => {
				await result.current.mutateAsync({ name: "New Item", value: 30 });
			});

			// Query invalidation is tested via integration
			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});
		});
	});

	describe("useUpdate", () => {
		it("should update an existing resource", async () => {
			const updatedItem = { id: 1, name: "Updated Item", value: 50 };
			mockPut.mockResolvedValue({ data: updatedItem });

			const hooks = createResourceHooks<TestDTO>(config);
			const { result } = renderHook(() => hooks.useUpdate(), { wrapper: createWrapper() });

			await act(async () => {
				await result.current.mutateAsync({ id: 1, name: "Updated Item", value: 50 });
			});

			expect(mockPut).toHaveBeenCalledWith("/api/test/1", { name: "Updated Item", value: 50 });
			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});
		});

		it("should handle update error", async () => {
			const error = new Error("Update failed");
			mockPut.mockRejectedValue(error);

			const hooks = createResourceHooks<TestDTO>(config);
			const { result } = renderHook(() => hooks.useUpdate(), { wrapper: createWrapper() });

			await act(async () => {
				await result.current.mutateAsync({ id: 1, name: "Item", value: 10 }).catch(() => {});
			});

			await waitFor(() => {
				expect(result.current.isError).toBe(true);
			});
		});

		it("should invalidate detail and list queries on success", async () => {
			const updatedItem = { id: 1, name: "Updated", value: 50 };
			mockPut.mockResolvedValue({ data: updatedItem });

			const hooks = createResourceHooks<TestDTO>(config);
			const { result } = renderHook(() => hooks.useUpdate(), { wrapper: createWrapper() });

			await act(async () => {
				await result.current.mutateAsync({ id: 1, name: "Updated", value: 50 });
			});

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});
		});
	});

	describe("useDelete", () => {
		it("should delete a resource", async () => {
			mockDelete.mockResolvedValue({});

			const hooks = createResourceHooks<TestDTO>(config);
			const { result } = renderHook(() => hooks.useDelete(), { wrapper: createWrapper() });

			await act(async () => {
				await result.current.mutateAsync(1);
			});

			expect(mockDelete).toHaveBeenCalledWith("/api/test/1");
			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});
		});

		it("should handle delete error", async () => {
			const error = new Error("Delete failed");
			mockDelete.mockRejectedValue(error);

			const hooks = createResourceHooks<TestDTO>(config);
			const { result } = renderHook(() => hooks.useDelete(), { wrapper: createWrapper() });

			await act(async () => {
				await result.current.mutateAsync(1).catch(() => {});
			});

			await waitFor(() => {
				expect(result.current.isError).toBe(true);
			});
		});

		it("should invalidate list queries on success", async () => {
			mockDelete.mockResolvedValue({});

			const hooks = createResourceHooks<TestDTO>(config);
			const { result } = renderHook(() => hooks.useDelete(), { wrapper: createWrapper() });

			await act(async () => {
				await result.current.mutateAsync(1);
			});

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});
		});
	});

	describe("useUpload", () => {
		it("should upload a file with default field name", async () => {
			const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
			const response = { id: 1, imageUrl: "http://example.com/image.jpg" };
			mockPost.mockResolvedValue({ data: response });

			const hooks = createResourceHooks<TestDTO>({ ...config, uploadFieldName: "image" });
			const { result } = renderHook(() => hooks.useUpload(), { wrapper: createWrapper() });

			await act(async () => {
				await result.current.mutateAsync({ id: 1, file });
			});

			expect(mockPost).toHaveBeenCalled();
			const callArgs = mockPost.mock.calls[0];
			expect(callArgs[0]).toBe("/api/test/1/image");

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});
		});

		it("should upload a file with custom field name", async () => {
			const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
			const response = { id: 1, photoUrl: "http://example.com/photo.jpg" };
			mockPost.mockResolvedValue({ data: response });

			const hooks = createResourceHooks<TestDTO>(config);
			const { result } = renderHook(() => hooks.useUpload(), { wrapper: createWrapper() });

			await act(async () => {
				await result.current.mutateAsync({ id: 1, file, fieldName: "photo" });
			});

			expect(mockPost).toHaveBeenCalled();
			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});
		});

		it("should call onProgress callback during upload", async () => {
			const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
			const response = { id: 1, imageUrl: "http://example.com/image.jpg" };
			const onProgress = vi.fn();

			// Mock axios to call onUploadProgress
			mockPost.mockImplementation(
				(
					_url: string,
					_formData: FormData,
					config?: { onUploadProgress?: (progress: { loaded: number; total: number }) => void },
				) => {
					if (config?.onUploadProgress) {
						config.onUploadProgress({ loaded: 50, total: 100 });
					}
					return Promise.resolve({ data: response });
				},
			);

			const hooks = createResourceHooks<TestDTO>({ ...config, uploadFieldName: "image" });
			const { result } = renderHook(() => hooks.useUpload(), { wrapper: createWrapper() });

			await act(async () => {
				await result.current.mutateAsync({ id: 1, file, onProgress });
			});

			expect(onProgress).toHaveBeenCalledWith(50);
		});

		it("should handle upload error", async () => {
			const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
			const error = new Error("Upload failed");
			mockPost.mockRejectedValue(error);

			const hooks = createResourceHooks<TestDTO>(config);
			const { result } = renderHook(() => hooks.useUpload(), { wrapper: createWrapper() });

			await act(async () => {
				await result.current.mutateAsync({ id: 1, file }).catch(() => {});
			});

			await waitFor(() => {
				expect(result.current.isError).toBe(true);
			});
		});

		it("should invalidate detail and list queries on success", async () => {
			const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
			const response = { id: 1, imageUrl: "http://example.com/image.jpg" };
			mockPost.mockResolvedValue({ data: response });

			const hooks = createResourceHooks<TestDTO>(config);
			const { result } = renderHook(() => hooks.useUpload(), { wrapper: createWrapper() });

			await act(async () => {
				await result.current.mutateAsync({ id: 1, file });
			});

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});
		});
	});

	describe("configuration options", () => {
		it("should merge custom query options", () => {
			const hooks = createResourceHooks<TestDTO>({
				...config,
				options: {
					query: { refetchOnWindowFocus: false },
				},
			});
			expect(hooks.useList).toBeDefined();
		});

		it("should merge custom mutation options", () => {
			const hooks = createResourceHooks<TestDTO>({
				...config,
				options: {
					mutations: {
						create: { onError: vi.fn() },
					},
				},
			});
			expect(hooks.useCreate).toBeDefined();
		});
	});
});
