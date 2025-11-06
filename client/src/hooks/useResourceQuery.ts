/**
 * @author Bob's Garage Team
 * @purpose Generic React Query hooks factory for CRUD operations
 * @version 1.0.0
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";

interface ResourceQueryConfig {
	resource: string;
	basePath: string;
	staleTime?: number;
	uploadFieldName?: string;
	options?: {
		query?: any;
		mutations?: {
			create?: any;
			update?: any;
			delete?: any;
		};
	};
}

/**
 * Creates a set of generic CRUD hooks for a resource
 */
export function createResourceHooks<
	DTO extends Record<string, unknown>,
	CreateDTO = Partial<DTO>,
	UpdateDTO = Partial<DTO>,
>(config: ResourceQueryConfig) {
	const queryKey = {
		all: [config.resource] as const,
		detail: (id: number) => [config.resource, id] as const,
	};

	return {
		/**
		 * List all resources
		 */
		useList: (options?: any) => {
			return useQuery<DTO[], unknown, DTO[], any>({
				queryKey: queryKey.all,
				queryFn: async (): Promise<DTO[]> => {
					const { data } = await api.get<DTO[] | { data: DTO[]; pagination?: any }>(config.basePath);
					if (Array.isArray(data)) return data;
					if (Array.isArray(data?.data)) return data.data;
					return [];
				},
				staleTime: config.staleTime ?? 30_000,
				...config.options?.query,
				...options,
			});
		},

		/**
		 * Get a single resource by ID
		 */
		useGet: (id?: number, options?: any) => {
			return useQuery<DTO, unknown, DTO, any>({
				queryKey: id ? queryKey.detail(id) : ["noop"],
				queryFn: async (): Promise<DTO> => {
					const { data } = await api.get<DTO>(`${config.basePath}/${id}`);
					return data;
				},
				enabled: Number.isFinite(id as number),
				...config.options?.query,
				...options,
			});
		},

		/**
		 * Create a new resource
		 */
		useCreate: (options?: any) => {
			const qc = useQueryClient();
			const {
				onMutate: userOnMutate,
				onError: userOnError,
				onSuccess: userOnSuccess,
				...restOptions
			} = options || {};
			const {
				onMutate: configOnMutate,
				onError: configOnError,
				onSuccess: configOnSuccess,
				...restConfig
			} = config.options?.mutations?.create || {};
			const customOnMutate = userOnMutate || configOnMutate;
			const customOnError = userOnError || configOnError;
			const customOnSuccess = userOnSuccess || configOnSuccess;

			return useMutation<DTO, unknown, CreateDTO, { previousData: DTO[] | undefined }>({
				mutationFn: async (payload: CreateDTO): Promise<DTO> => {
					const { data } = await api.post<DTO>(config.basePath, payload as any);
					return data;
				},
				onMutate: async (vars) => {
					// Cancel any outgoing refetches to avoid overwriting our optimistic update
					await qc.cancelQueries({ queryKey: queryKey.all });

					// Snapshot the previous value
					const previousData = qc.getQueryData<DTO[]>(queryKey.all);

					// Optimistically add a temporary item (will be replaced with server response)
					if (previousData) {
						// Create a temporary item with a negative ID (temporary)
						const tempItem = {
							...vars,
							id: -Date.now(), // Temporary negative ID
						} as unknown as DTO;
						qc.setQueryData<DTO[]>(queryKey.all, [...previousData, tempItem]);
					}

					// Call custom onMutate if provided
					const customContext = await customOnMutate?.(vars);

					// Return context with previous data for rollback
					return { previousData, ...customContext };
				},
				onError: (err, vars, context) => {
					// Rollback on error
					if (context?.previousData) {
						qc.setQueryData(queryKey.all, context.previousData);
					}
					// Call custom onError if provided
					customOnError?.(err, vars, context);
				},
				onSuccess: (newData, vars, context) => {
					// Replace the temporary item with the real server response
					const currentData = qc.getQueryData<DTO[]>(queryKey.all);
					if (currentData) {
						// Remove temporary item and add the real one
						const filtered = currentData.filter((item) => {
							const itemWithId = item as unknown as { id: number };
							return itemWithId.id >= 0; // Remove temporary negative IDs
						});
						qc.setQueryData<DTO[]>(queryKey.all, [...filtered, newData]);
					} else {
						// If no cache, just set it
						qc.setQueryData<DTO[]>(queryKey.all, [newData]);
					}
					// Refetch in background to ensure consistency
					qc.invalidateQueries({ queryKey: queryKey.all });
					// Call custom onSuccess if provided
					customOnSuccess?.(newData, vars, context);
				},
				...restOptions,
				...restConfig,
			});
		},

		/**
		 * Update an existing resource
		 */
		useUpdate: (options?: any) => {
			const qc = useQueryClient();
			const {
				onMutate: userOnMutate,
				onError: userOnError,
				onSuccess: userOnSuccess,
				...restOptions
			} = options || {};
			const {
				onMutate: configOnMutate,
				onError: configOnError,
				onSuccess: configOnSuccess,
				...restConfig
			} = config.options?.mutations?.update || {};
			const customOnMutate = userOnMutate || configOnMutate;
			const customOnError = userOnError || configOnError;
			const customOnSuccess = userOnSuccess || configOnSuccess;

			return useMutation<
				DTO,
				unknown,
				UpdateDTO & { id: number },
				{ previousData: DTO[] | undefined }
			>({
				mutationFn: async ({ id, ...payload }: UpdateDTO & { id: number }): Promise<DTO> => {
					const { data } = await api.put<DTO>(`${config.basePath}/${id}`, payload as any);
					return data;
				},
				onMutate: async (vars) => {
					// Cancel any outgoing refetches to avoid overwriting our optimistic update
					await qc.cancelQueries({ queryKey: queryKey.all });

					// Snapshot the previous value
					const previousData = qc.getQueryData<DTO[]>(queryKey.all);

					// Optimistically update the item in cache
					if (previousData) {
						const { id, ...updatePayload } = vars;
						qc.setQueryData<DTO[]>(
							queryKey.all,
							previousData.map((item) => {
								const itemWithId = item as unknown as { id: number };
								if (itemWithId.id === id) {
									// Merge the update payload with existing item (excluding id)
									return { ...item, ...updatePayload } as DTO;
								}
								return item;
							}),
						);
					}

					// Call custom onMutate if provided
					const customContext = await customOnMutate?.(vars);

					// Return context with previous data for rollback
					return { previousData, ...customContext };
				},
				onError: (err, vars, context) => {
					// Rollback on error
					if (context?.previousData) {
						qc.setQueryData(queryKey.all, context.previousData);
					}
					// Call custom onError if provided
					customOnError?.(err, vars, context);
				},
				onSuccess: (updatedData, vars, context) => {
					// Update with server response and refetch in background
					const currentData = qc.getQueryData<DTO[]>(queryKey.all);
					if (currentData) {
						qc.setQueryData<DTO[]>(
							queryKey.all,
							currentData.map((item) => {
								const itemWithId = item as unknown as { id: number };
								return itemWithId.id === vars.id ? updatedData : item;
							}),
						);
					}
					// Refetch in background to ensure consistency
					qc.invalidateQueries({ queryKey: queryKey.detail(vars.id) });
					qc.invalidateQueries({ queryKey: queryKey.all });
					// Call custom onSuccess if provided
					customOnSuccess?.(updatedData, vars, context);
				},
				...restOptions,
				...restConfig,
			});
		},

		/**
		 * Delete a resource
		 */
		useDelete: (options?: any) => {
			const qc = useQueryClient();
			const {
				onMutate: userOnMutate,
				onError: userOnError,
				onSuccess: userOnSuccess,
				...restOptions
			} = options || {};
			const {
				onMutate: configOnMutate,
				onError: configOnError,
				onSuccess: configOnSuccess,
				...restConfig
			} = config.options?.mutations?.delete || {};

			return useMutation<void, unknown, number, { previousData: DTO[] | undefined }>({
				mutationFn: async (id: number): Promise<void> => {
					await api.delete(`${config.basePath}/${id}`);
				},
				onMutate: async (id: number) => {
					// Call config onMutate if provided
					const configContext = await configOnMutate?.(id);

					// Cancel any outgoing refetches to avoid overwriting our optimistic update
					await qc.cancelQueries({ queryKey: queryKey.all });

					// Snapshot the previous value
					const previousData = qc.getQueryData<DTO[]>(queryKey.all);

					// Optimistically remove the item from cache
					if (previousData) {
						qc.setQueryData<DTO[]>(
							queryKey.all,
							previousData.filter((item) => {
								const itemWithId = item as unknown as { id: number };
								return itemWithId.id !== id;
							}),
						);
					}

					// Return context with the previous value (merge with config context if any)
					return { previousData, ...configContext };
				},
				onError: (_err, _id, context) => {
					// If the mutation fails, roll back to the previous value
					if (context?.previousData) {
						qc.setQueryData(queryKey.all, context.previousData);
					}
					// Call config error handler if provided
					configOnError?.(_err, _id, context);
					// Call user's error handler if provided
					userOnError?.(_err, _id, context);
				},
				onSuccess: (_data, id, _context) => {
					// Invalidate to refetch and ensure consistency
					qc.invalidateQueries({ queryKey: queryKey.all });
					// Also remove the detail query for this specific item
					qc.removeQueries({ queryKey: queryKey.detail(id) });
					// Call config success handler if provided
					configOnSuccess?.(_data, id, _context);
					// Call user's success handler if provided
					userOnSuccess?.(_data, id, _context);
				},
				...restOptions,
				...restConfig,
			});
		},

		/**
		 * Upload a file for a resource
		 */
		useUpload: (options?: any) => {
			const qc = useQueryClient();
			const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {};
			return useMutation({
				mutationFn: async ({
					id,
					file,
					fieldName,
					onProgress,
				}: {
					id: number;
					file: File;
					fieldName?: string;
					onProgress?: (pct: number) => void;
				}): Promise<{ id: number; imageUrl?: string; photoUrl?: string }> => {
					const form = new FormData();
					const uploadField = fieldName || config.uploadFieldName || "file";
					form.append(uploadField, file);

					const { data } = await api.post(`${config.basePath}/${id}/image`, form, {
						onUploadProgress: (evt) => {
							if (onProgress && evt.total) {
								onProgress(Math.round((evt.loaded / evt.total) * 100));
							}
						},
					});
					return data;
				},
				onSuccess: (data, vars) => {
					qc.invalidateQueries({ queryKey: queryKey.detail(vars.id) });
					qc.invalidateQueries({ queryKey: queryKey.all });
					customOnSuccess?.(data, vars);
				},
				onError: (err, vars, context) => {
					customOnError?.(err, vars, context);
				},
				...restOptions,
			});
		},

		/**
		 * Get query keys (useful for manual invalidation)
		 */
		getQueryKeys: () => queryKey,
	};
}

export default createResourceHooks;
