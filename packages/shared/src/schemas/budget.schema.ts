import { z } from 'zod';

export const createBudgetSchema = z.object({
  name: z.string().min(1, 'Budget name is required').max(64).trim(),
  amountLimit: z.number().int('Limit must be an integer in paise').positive('Limit must be greater than 0'),
  period: z.enum(['weekly', 'monthly', 'custom']).default('monthly'),
  categoryId: z.string().optional().nullable(),
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional(),
});

export const updateBudgetSchema = createBudgetSchema.partial();
