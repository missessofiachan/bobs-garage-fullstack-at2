import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../axios';
import type { StaffDTO } from '../types';

const key = {
	all: ['staff'] as const,
	detail: (id: number) => ['staff', id] as const,
};

export function useStaffList() {
	return useQuery({
		queryKey: key.all,
		queryFn: async (): Promise<StaffDTO[]> => {
			const { data } = await api.get<StaffDTO[]>('/staff');
			return data;
		},
		staleTime: 30_000,
	});
}

export function useStaff(id?: number) {
	return useQuery({
		queryKey: id ? key.detail(id) : ['staff', 'noop'],
		queryFn: async (): Promise<StaffDTO> => {
			const { data } = await api.get<StaffDTO>(`/staff/${id}`);
			return data;
		},
		enabled: Number.isFinite(id as number),
	});
}

export function useCreateStaff() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (payload: Partial<StaffDTO>): Promise<StaffDTO> => {
			const { data } = await api.post<StaffDTO>('/staff', payload);
			return data;
		},
		onSuccess: () => { qc.invalidateQueries({ queryKey: key.all }); },
	});
}

export function useUpdateStaff() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, ...payload }: Partial<StaffDTO> & { id: number }): Promise<StaffDTO> => {
			const { data } = await api.put<StaffDTO>(`/staff/${id}`, payload);
			return data;
		},
		onSuccess: (_d, vars) => {
			qc.invalidateQueries({ queryKey: key.detail(vars.id) });
			qc.invalidateQueries({ queryKey: key.all });
		},
	});
}

export function useDeleteStaff() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (id: number) => {
			await api.delete(`/staff/${id}`);
		},
		onSuccess: () => { qc.invalidateQueries({ queryKey: key.all }); },
	});
}

export default useStaffList;
