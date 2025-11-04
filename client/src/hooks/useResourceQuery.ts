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
					// Handle both array responses and object responses with { data: [...], pagination: {...} }
					if (Array.isArray(data)) {
						return data;
					}
					// If it's an object with a data property, extract the array
					if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
						return data.data;
					}
					// Fallback to empty array if structure is unexpected
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
			return useMutation({
				mutationFn: async (payload: CreateDTO): Promise<DTO> => {
					const { data } = await api.post<DTO>(config.basePath, payload as any);
					return data;
				},
				onSuccess: () => {
					qc.invalidateQueries({ queryKey: queryKey.all });
				},
				...config.options?.mutations?.create,
				...options,
			});
		},

		/**
		 * Update an existing resource
		 */
		useUpdate: (options?: any) => {
			const qc = useQueryClient();
			return useMutation({
				mutationFn: async ({ id, ...payload }: UpdateDTO & { id: number }): Promise<DTO> => {
					const { data } = await api.put<DTO>(`${config.basePath}/${id}`, payload as any);
					return data;
				},
				onSuccess: (_d, vars) => {
					qc.invalidateQueries({ queryKey: queryKey.detail(vars.id) });
					qc.invalidateQueries({ queryKey: queryKey.all });
				},
				...config.options?.mutations?.update,
				...options,
			});
		},

		/**
		 * Delete a resource
		 */
		useDelete: (options?: any) => {
			const qc = useQueryClient();
			return useMutation({
				mutationFn: async (id: number): Promise<void> => {
					await api.delete(`${config.basePath}/${id}`);
				},
				onSuccess: () => {
					qc.invalidateQueries({ queryKey: queryKey.all });
				},
				...config.options?.mutations?.delete,
				...options,
			});
		},

		/**
		 * Upload a file for a resource
		 */
		useUpload: () => {
			const qc = useQueryClient();
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
				onSuccess: (_d, vars) => {
					qc.invalidateQueries({ queryKey: queryKey.detail(vars.id) });
					qc.invalidateQueries({ queryKey: queryKey.all });
				},
			});
		},

		/**
		 * Get query keys (useful for manual invalidation)
		 */
		getQueryKeys: () => queryKey,
	};
}

export default createResourceHooks;
