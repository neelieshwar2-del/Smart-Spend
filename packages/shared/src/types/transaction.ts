export type TransactionType = 'expense' | 'income';

export type PaymentMethod =
  | 'UPI'
  | 'Cash'
  | 'Debit Card'
  | 'Credit Card'
  | 'Net Banking'
  | 'Other';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  userId?: string | null;
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;             // Stored in paise (integer minor units, e.g. 45000 = ₹450.00)
  amountRupees: number;       // e.g. 450.00
  amountFormatted: string;    // e.g. "₹450.00"
  categoryId: string;
  category?: Category;
  title: string;
  merchant?: string | null;
  note?: string | null;
  transactionDate: string;    // ISO Date
  paymentMethod: PaymentMethod;
  isRecurring?: boolean;
  recurringRuleId?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateTransactionDTO {
  amount: number;             // In integer paise
  type: TransactionType;
  categoryId: string;
  title: string;
  merchant?: string;
  paymentMethod?: PaymentMethod;
  transactionDate?: string;
  note?: string;
}
