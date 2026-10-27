export interface Budget {
  id: string;
  userId: string;
  name: string;
  amountLimit: number;          // In integer paise (e.g. 4500000 = ₹45,000.00)
  amountLimitRupees: number;
  amountLimitFormatted: string;
  period: 'weekly' | 'monthly' | 'custom';
  categoryId?: string | null;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BudgetSummary {
  hasBudget: boolean;
  budget?: {
    id: string;
    name: string;
    period: string;
    amountLimit: number;
    amountLimitFormatted: string;
    totalSpent: number;
    totalSpentFormatted: string;
    remaining: number;
    remainingFormatted: string;
    percentageUsed: number;
    percentageLeft: number;
    daysRemaining: number;
    dailyAllowance: number;
    dailyAllowanceFormatted: string;
    warningStatus: 'safe' | 'warning' | 'critical' | 'exceeded';
  };
  message?: string;
}
