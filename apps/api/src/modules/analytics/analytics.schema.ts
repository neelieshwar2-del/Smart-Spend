import { z } from 'zod';

export const analyticsPeriodEnum = z.enum([
  'this_month',
  'last_month',
  'last_30_days',
  'last_90_days',
  'this_year',
  'custom',
]);

export const analyticsQuerySchema = z.object({
  period: analyticsPeriodEnum.optional().default('this_month'),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const trailingMonthsQuerySchema = z.object({
  months: z.coerce.number().int().min(1).max(36).default(6),
});

export const trendsQuerySchema = z.object({
  period: z.enum(['last_30_days', 'last_90_days', 'this_month', 'last_month']).default('last_30_days'),
});

export type AnalyticsQueryParams = z.infer<typeof analyticsQuerySchema>;
export type TrailingMonthsQueryParams = z.infer<typeof trailingMonthsQuerySchema>;
export type TrendsQueryParams = z.infer<typeof trendsQuerySchema>;
