import { z } from 'zod';
import { rupeesToPaise } from '../../utils/money.js';

export const createTransactionSchema = z.object({
  // Allows amount in rupees (e.g. 450.50) or paise (integer)
  amount: z
    .number({ required_error: 'Amount is required' })
    .positive('Amount must be greater than zero')
    .transform(val => rupeesToPaise(val)),
  type: z.enum(['expense', 'income'], {
    errorMap: () => ({ message: "Type must be either 'expense' or 'income'" }),
  }),
  categoryId: z.string({ required_error: 'Category ID is required' }).min(1),
  title: z.string().trim().min(1, 'Title or recipient is required').max(120),
  merchant: z.string().trim().max(120).optional().nullable(),
  note: z.string().trim().max(500).optional().nullable(),
  transactionDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}/))
    .optional()
    .transform(val => (val ? new Date(val) : new Date())),
  paymentMethod: z.string().trim().max(50).optional().default('UPI'),
  isRecurring: z.boolean().optional().default(false),
  recurringRuleId: z.string().optional().nullable(),
});

export const updateTransactionSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be greater than zero')
    .transform(val => rupeesToPaise(val))
    .optional(),
  type: z.enum(['expense', 'income']).optional(),
  categoryId: z.string().min(1).optional(),
  title: z.string().trim().min(1).max(120).optional(),
  merchant: z.string().trim().max(120).optional().nullable(),
  note: z.string().trim().max(500).optional().nullable(),
  transactionDate: z
    .string()
    .optional()
    .transform(val => (val ? new Date(val) : undefined)),
  paymentMethod: z.string().trim().max(50).optional(),
});

export const transactionQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  categoryId: z.string().optional(),
  type: z.enum(['expense', 'income']).optional(),
  paymentMethod: z.string().optional(),
  search: z.string().trim().optional(),
  sortBy: z.enum(['transactionDate', 'amount', 'createdAt']).default('transactionDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionQueryParams = z.infer<typeof transactionQuerySchema>;
