import { z } from 'zod';

export const aiChatSchema = z.object({
  message: z.string().trim().min(1, 'Message is required').max(1000),
  context: z
    .object({
      currentTab: z.string().optional(),
      suggestedMerchant: z.string().optional(),
    })
    .optional(),
});

export const aiInsightsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  dismissed: z
    .enum(['true', 'false'])
    .optional()
    .transform(val => (val !== undefined ? val === 'true' : undefined)),
});

export type AiChatInput = z.infer<typeof aiChatSchema>;
export type AiInsightsQueryParams = z.infer<typeof aiInsightsQuerySchema>;
