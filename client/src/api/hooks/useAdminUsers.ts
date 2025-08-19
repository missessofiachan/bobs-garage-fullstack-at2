import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../axios';
import type { AdminUserDTO, Role } from '../types';

const key = {
  all: ['admin', 'users'] as const,
  detail: (id: number) => ['admin', 'users', id] as const,
};

export function useAdminUsers() {
  return useQuery({
    queryKey: key.all,
    queryFn: async (): Promise<AdminUserDTO[]> => {
      const { data } = await api.get<AdminUserDTO[]>('/admin/users');
      return data;
    },
  });
}

export function useAdminUser(id?: number) {
  return useQuery({
    queryKey: id ? key.detail(id) : ['admin', 'users', 'noop'],
    queryFn: async (): Promise<AdminUserDTO> => {
      const { data } = await api.get<AdminUserDTO>(`/admin/users/${id}`);
      return data;
    },
    enabled: Number.isFinite(id as number),
  });
}

export function useCreateAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { email: string; password: string; role?: Role; active?: boolean }): Promise<AdminUserDTO> => {
      const { data } = await api.post<AdminUserDTO>('/admin/users', payload);
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: key.all }); },
  });
}

export function useUpdateAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<AdminUserDTO> & { id: number; password?: string }): Promise<AdminUserDTO> => {
      const { data } = await api.put<AdminUserDTO>(`/admin/users/${id}`, payload);
      return data;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: key.detail(v.id) });
      qc.invalidateQueries({ queryKey: key.all });
    },
  });
}

export function useDeleteAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => { await api.delete(`/admin/users/${id}`); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: key.all }); },
  });
}

export default useAdminUsers;
