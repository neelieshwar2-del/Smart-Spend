import { z } from 'zod';
import { PAYMENT_METHODS } from '../constants/payment-methods.js';

export const createTransactionSchema = z.object({
  type: z.enum(['expense', 'income']).default('expense'),
  amount: z.number().int('Amount must be an integer in paise').positive('Amount must be greater than 0'),
  categoryId: z.string().min(1, 'Category is required'),
  title: z.string().min(1, 'Title or payee is required').max(128).trim(),
  merchant: z.string().max(128).optional().nullable(),
  note: z.string().max(512).optional().nullable(),
  transactionDate: z.string().or(z.date()).optional(),
  paymentMethod: z.enum(PAYMENT_METHODS).default('UPI'),
  isRecurring: z.boolean().default(false),
  recurringRuleId: z.string().optional().nullable(),
});

export const updateTransactionSchema = createTransactionSchema.partial();
