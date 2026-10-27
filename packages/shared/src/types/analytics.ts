export interface AnalyticsSummary {
  totalIncome: number;
  totalIncomeFormatted: string;
  totalExpense: number;
  totalExpenseFormatted: string;
  netSavings: number;
  netSavingsFormatted: string;
  savingsRate: number; // Percentage, e.g. 66
  averageDailySpend: number;
  averageDailySpendFormatted: string;
}

export interface CategoryBreakdownItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  amount: number;
  amountFormatted: string;
  percentage: number;
  count: number;
}

export interface DailySpendingItem {
  date: string;
  amount: number;
  amountFormatted: string;
}
