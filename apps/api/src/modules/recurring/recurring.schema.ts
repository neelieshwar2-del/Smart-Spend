import { z } from 'zod';
import { rupeesToPaise } from '../../utils/money.js';

export const recurringFrequencyEnum = z.enum(['daily', 'weekly', 'monthly', 'yearly'], {
  errorMap: () => ({ message: "Frequency must be 'daily', 'weekly', 'monthly', or 'yearly'" }),
});

export const createRecurringSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120),
  amount: z
    .number({ required_error: 'Amount is required' })
    .positive('Amount must be greater than zero')
    .transform(val => rupeesToPaise(val)),
  categoryId: z.string({ required_error: 'Category ID is required' }).min(1),
  frequency: recurringFrequencyEnum.default('monthly'),
  interval: z.coerce.number().int().min(1).default(1),
  startDate: z
    .string()
    .optional()
    .transform(val => (val ? new Date(val) : new Date())),
  nextDueDate: z
    .string()
    .optional()
    .transform(val => (val ? new Date(val) : undefined)),
  endDate: z
    .string()
    .optional()
    .nullable()
    .transform(val => (val ? new Date(val) : null)),
  paymentMethod: z.string().trim().max(50).optional().default('UPI'),
  autoRecord: z.boolean().optional().default(true),
  isActive: z.boolean().optional().default(true),
});

export const updateRecurringSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  amount: z
    .number()
    .positive('Amount must be greater than zero')
    .transform(val => rupeesToPaise(val))
    .optional(),
  categoryId: z.string().min(1).optional(),
  frequency: recurringFrequencyEnum.optional(),
  interval: z.coerce.number().int().min(1).optional(),
  nextDueDate: z
    .string()
    .optional()
    .transform(val => (val ? new Date(val) : undefined)),
  endDate: z
    .string()
    .optional()
    .nullable()
    .transform(val => (val ? new Date(val) : null)),
  paymentMethod: z.string().trim().max(50).optional(),
  autoRecord: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const recurringQuerySchema = z.object({
  isActive: z
    .enum(['true', 'false'])
    .optional()
    .transform(val => (val !== undefined ? val === 'true' : undefined)),
  categoryId: z.string().optional(),
});

export type CreateRecurringInput = z.infer<typeof createRecurringSchema>;
export type UpdateRecurringInput = z.infer<typeof updateRecurringSchema>;
export type RecurringQueryParams = z.infer<typeof recurringQuerySchema>;
