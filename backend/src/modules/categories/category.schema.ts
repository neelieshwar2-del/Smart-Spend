import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z
    .string({ required_error: 'Category name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
  icon: z
    .string({ required_error: 'Category icon is required' })
    .trim()
    .min(1, 'Icon identifier is required'),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color must be a valid hex code (e.g. #416900)')
    .optional()
    .default('#555e74'),
  type: z.enum(['expense', 'income'], {
    errorMap: () => ({ message: "Type must be either 'expense' or 'income'" }),
  }),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
