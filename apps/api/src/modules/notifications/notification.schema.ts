import { z } from 'zod';

export const createNotificationSchema = z.object({
  type: z.enum(['BUDGET_WARNING', 'RECURRING_DUE', 'TRANSACTION_LOGGED', 'INSIGHT_READY']),
  title: z.string().trim().min(1).max(150),
  message: z.string().trim().min(1).max(500),
});

export const notificationQuerySchema = z.object({
  unreadOnly: z
    .enum(['true', 'false'])
    .optional()
    .transform(val => (val !== undefined ? val === 'true' : undefined)),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type NotificationQueryParams = z.infer<typeof notificationQuerySchema>;
