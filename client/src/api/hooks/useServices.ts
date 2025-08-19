import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../axios';
import type { ServiceDTO } from '../types';

const key = {
	all: ['services'] as const,
	detail: (id: number) => ['services', id] as const,
};

export function useServices() {
	return useQuery({
		queryKey: key.all,
		queryFn: async (): Promise<ServiceDTO[]> => {
			const { data } = await api.get<ServiceDTO[]>('/services');
			return data;
		},
		staleTime: 30_000,
	});
}

export function useService(id?: number) {
	return useQuery({
		queryKey: id ? key.detail(id) : ['services', 'noop'],
		queryFn: async (): Promise<ServiceDTO> => {
			const { data } = await api.get<ServiceDTO>(`/services/${id}`);
			return data;
		},
		enabled: Number.isFinite(id as number),
	});
}

export function useCreateService() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (payload: Partial<ServiceDTO>): Promise<ServiceDTO> => {
			const { data } = await api.post<ServiceDTO>('/services', payload);
			return data;
		},
		onSuccess: () => { qc.invalidateQueries({ queryKey: key.all }); },
	});
}

export function useUpdateService() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, ...payload }: Partial<ServiceDTO> & { id: number }): Promise<ServiceDTO> => {
			const { data } = await api.put<ServiceDTO>(`/services/${id}`, payload);
			return data;
		},
		onSuccess: (_d, vars) => {
			qc.invalidateQueries({ queryKey: key.detail(vars.id) });
			qc.invalidateQueries({ queryKey: key.all });
		},
	});
}

export function useDeleteService() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (id: number) => {
			await api.delete(`/services/${id}`);
		},
		onSuccess: () => { qc.invalidateQueries({ queryKey: key.all }); },
	});
}

export default useServices;
