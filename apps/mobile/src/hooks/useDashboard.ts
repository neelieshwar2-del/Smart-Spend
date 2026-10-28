import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { DashboardData } from '../types';

export const EMPTY_DASHBOARD: DashboardData = {
  summary: {
    totalIncome: 0,
    totalIncomeFormatted: '₹0.00',
    totalExpenses: 0,
    totalExpensesFormatted: '₹0.00',
    netCashFlow: 0,
    netCashFlowFormatted: '₹0.00',
  },
  monthlyBudget: {
    hasBudget: false,
    amountLimit: 0,
    amountLimitFormatted: '₹0.00',
    totalSpent: 0,
    totalSpentFormatted: '₹0.00',
    amountSpentFormatted: '₹0.00',
    remainingSafe: 0,
    remainingSafeFormatted: '₹0.00',
    percentageUsed: 0,
    percentageLeft: 100,
    daysRemaining: 0,
    dailyAllowance: 0,
    dailyAllowanceFormatted: '₹0.00',
    warningStatus: 'safe',
  },
  todaySpending: {
    todaySpent: 0,
    todaySpentFormatted: '₹0.00',
    dailyTarget: 0,
    dailyTargetFormatted: '₹0.00',
    bufferRemaining: 0,
    bufferRemainingFormatted: '₹0.00',
    onTrack: true,
    percentageOfAllowance: 0,
  },
  topCategories: [],
  recentTransactions: [],
  smartTip: 'Add your first transaction to calculate budget insights and daily pacing.',
  upcomingSubscriptions: [],
};

export const useDashboard = () => {
  const queryClient = useQueryClient();

  const query = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => api.getDashboard(),
    staleTime: 10000,
  });

  const refetch = () => {
    return queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  return {
    dashboard: query.data || EMPTY_DASHBOARD,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch,
  };
};
