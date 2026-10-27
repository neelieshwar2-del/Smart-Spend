import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { DashboardData } from '../types';

export const useDashboard = () => {
  const queryClient = useQueryClient();

  const query = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => api.getDashboard(),
    staleTime: 30000, // 30 seconds
  });

  const refetch = () => {
    return queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  return {
    dashboard: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch,
  };
};
