import { z } from 'zod';
import { rupeesToPaise } from '../../utils/money.js';

export const createBudgetSchema = z.object({
  name: z
    .string({ required_error: 'Budget name is required' })
    .trim()
    .min(2, 'Budget name must be at least 2 characters')
    .max(100),
  amountLimit: z
    .number({ required_error: 'Amount limit is required' })
    .positive('Budget limit must be greater than zero')
    .transform(val => rupeesToPaise(val)),
  period: z.enum(['weekly', 'monthly'], {
    errorMap: () => ({ message: "Period must be either 'weekly' or 'monthly'" }),
  }).default('monthly'),
  categoryId: z.string().optional().nullable(),
  startDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}/))
    .optional()
    .transform(val => {
      if (val) return new Date(val);
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), 1); // Start of month
    }),
  endDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}/))
    .optional()
    .transform(val => {
      if (val) return new Date(val);
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59); // End of month
    }),
});

export const updateBudgetSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  amountLimit: z
    .number()
    .positive('Budget limit must be greater than zero')
    .transform(val => rupeesToPaise(val))
    .optional(),
  period: z.enum(['weekly', 'monthly']).optional(),
  categoryId: z.string().optional().nullable(),
  startDate: z
    .string()
    .optional()
    .transform(val => (val ? new Date(val) : undefined)),
  endDate: z
    .string()
    .optional()
    .transform(val => (val ? new Date(val) : undefined)),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
