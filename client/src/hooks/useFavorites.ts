/**
 * @author Bob's Garage Team
 * @purpose Hook for managing favorites that syncs with backend API
 * @version 1.0.0
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import type { ServiceDTO } from '../api/types';

export function useFavorites() {
  const queryClient = useQueryClient();
  const accessToken = useSelector((s: any) => s.auth.accessToken);
  const isAuthenticated = !!accessToken;

  const { data: favorites = [], isLoading } = useQuery<ServiceDTO[]>({
    queryKey: ['favorites'],
    queryFn: async () => {
      const { data } = await api.get<ServiceDTO[]>('/users/me/favorites');
      return data;
    },
    enabled: isAuthenticated,
    staleTime: 30000,
  });

  const addFavoriteMutation = useMutation({
    mutationFn: async (serviceId: number) => {
      const { data } = await api.post(`/users/me/favorites/${serviceId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (serviceId: number) => {
      await api.delete(`/users/me/favorites/${serviceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const addFavorite = (serviceId: number) => {
    return addFavoriteMutation.mutateAsync(serviceId);
  };

  const removeFavorite = (serviceId: number) => {
    return removeFavoriteMutation.mutateAsync(serviceId);
  };

  const isFavorite = (serviceId: number) => {
    return favorites.some((fav) => fav.id === serviceId);
  };

  return {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    isFavorite,
    isAdding: addFavoriteMutation.isPending,
    isRemoving: removeFavoriteMutation.isPending,
    isAuthenticated,
  };
}
