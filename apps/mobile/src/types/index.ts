export type TransactionType = 'expense' | 'income';

export type PaymentMethod = 'UPI' | 'Cash' | 'Debit Card' | 'Credit Card' | 'Net Banking' | 'Other';

export interface User {
  id: string;
  name: string;
  email: string;
  currency: string;
  timezone: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  isDefault?: boolean;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_food', name: 'Food & Dining', icon: 'utensils', color: '#F59E0B', type: 'expense', isDefault: true },
  { id: 'cat_groceries', name: 'Groceries', icon: 'shopping-cart', color: '#10B981', type: 'expense', isDefault: true },
  { id: 'cat_transport', name: 'Transport', icon: 'car', color: '#3B82F6', type: 'expense', isDefault: true },
  { id: 'cat_shopping', name: 'Shopping', icon: 'shopping-bag', color: '#EC4899', type: 'expense', isDefault: true },
  { id: 'cat_bills', name: 'Bills & Utilities', icon: 'zap', color: '#8B5CF6', type: 'expense', isDefault: true },
  { id: 'cat_entertainment', name: 'Entertainment', icon: 'film', color: '#F43F5E', type: 'expense', isDefault: true },
  { id: 'cat_health', name: 'Health & Fitness', icon: 'heart', color: '#06B6D4', type: 'expense', isDefault: true },
  { id: 'cat_education', name: 'Education', icon: 'book', color: '#6366F1', type: 'expense', isDefault: true },
  { id: 'cat_salary', name: 'Salary', icon: 'briefcase', color: '#22C55E', type: 'income', isDefault: true },
  { id: 'cat_freelance', name: 'Freelance', icon: 'laptop', color: '#14B8A6', type: 'income', isDefault: true },
  { id: 'cat_investments', name: 'Investments', icon: 'trending-up', color: '#84CC16', type: 'income', isDefault: true },
];

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;             // Amount in integer paise
  amountRupees?: number;
  amountFormatted: string;    // Formatted string (e.g. "₹450.00")
  categoryId: string;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
  title: string;
  merchant?: string | null;
  note?: string | null;
  transactionDate: string;    // ISO Date string
  paymentMethod: PaymentMethod;
  isRecurring?: boolean;
  createdAt?: string;
  formattedDate?: string;
}

export interface MonthlyBudget {
  hasBudget: boolean;
  amountLimit: number;         // In paise
  amountLimitFormatted: string;// "₹45,000.00"
  totalSpent: number;          // In paise
  totalSpentFormatted: string; // "₹28,450.00"
  amountSpentFormatted?: string;
  remainingSafe: number;       // In paise
  remainingSafeFormatted: string; // "₹16,550.00"
  percentageUsed: number;      // e.g. 63
  percentageLeft: number;      // e.g. 37
  daysRemaining: number;       // e.g. 5
  dailyAllowance: number;      // In paise
  dailyAllowanceFormatted: string; // "₹3,310.00"
  warningStatus: 'safe' | 'warning' | 'critical' | 'exceeded';
}

export interface TodaySpending {
  todaySpent: number;          // In paise
  todaySpentFormatted: string; // "₹840.00"
  dailyTarget: number;         // In paise
  dailyTargetFormatted: string;// "₹1,200.00"
  percentageOfAllowance: number;
  bufferRemaining: number;
  bufferRemainingFormatted: string;
  onTrack: boolean;
}

export interface DashboardSummary {
  totalIncome: number;
  totalIncomeFormatted: string;
  totalExpenses: number;
  totalExpensesFormatted: string;
  netCashFlow: number;
  netCashFlowFormatted: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  monthlyBudget: MonthlyBudget;
  todaySpending: TodaySpending;
  topCategories: Array<{
    name: string;
    icon: string;
    color: string;
    amount: number;
    amountFormatted: string;
    percentage: number;
  }>;
  recentTransactions: Transaction[];
  smartTip: string;
  upcomingSubscriptions: Array<{
    title: string;
    amountFormatted: string;
    dueDate: string;
  }>;
}

export interface RecurringRule {
  id: string;
  title: string;
  amount: number;
  amountFormatted: string;
  categoryId: string;
  categoryName?: string;
  categoryIcon?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextDueDate: string;
  isActive: boolean;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  body?: string;
  readAt?: string | null;
  createdAt: string;
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  model?: string;
  metrics?: {
    totalExpense?: string;
    remainingBudget?: string;
    topCategory?: string;
  };
}

export interface CreateTransactionPayload {
  amount: number; // in paise
  type: TransactionType;
  categoryId: string;
  title: string;
  merchant?: string;
  paymentMethod: PaymentMethod;
  transactionDate?: string;
  note?: string;
}
