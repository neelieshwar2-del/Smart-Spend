import { categoryRepository, CategoryRecord } from './category.repository.js';
import { CreateCategoryInput, UpdateCategoryInput } from './category.schema.js';
import { AppError } from '../../middlewares/errorHandler.js';

export class CategoryService {
  async listCategories(userId: string): Promise<CategoryRecord[]> {
    let categories = await categoryRepository.listCategories(userId);
    if (categories.length === 0) {
      categories = categoryRepository.seedDefaults(userId);
    }
    return categories;
  }

  async getCategoryById(userId: string, categoryId: string): Promise<CategoryRecord> {
    const category = await categoryRepository.findById(categoryId);
    if (!category) {
      throw new AppError('Category not found.', 404, 'NOT_FOUND');
    }
    // Allow if user-owned or system default
    if (category.userId && category.userId !== userId && !category.isDefault) {
      throw new AppError('Access denied.', 403, 'FORBIDDEN');
    }
    return category;
  }

  async createCategory(userId: string, input: CreateCategoryInput): Promise<CategoryRecord> {
    const existing = await categoryRepository.findByNameAndType(userId, input.name, input.type);
    if (existing) {
      throw new AppError(
        `A category named "${input.name}" for ${input.type}s already exists.`,
        409,
        'DUPLICATE_CATEGORY'
      );
    }

    return await categoryRepository.create({
      userId,
      name: input.name,
      icon: input.icon,
      color: input.color || '#555e74',
      type: input.type,
      isDefault: false,
    });
  }

  async updateCategory(
    userId: string,
    categoryId: string,
    input: UpdateCategoryInput
  ): Promise<CategoryRecord> {
    const category = await categoryRepository.findById(categoryId);
    if (!category) {
      throw new AppError('Category not found.', 404, 'NOT_FOUND');
    }

    if (category.isDefault) {
      throw new AppError('System default categories cannot be modified.', 400, 'CANNOT_MODIFY_DEFAULT');
    }

    if (category.userId !== userId) {
      throw new AppError('You do not have permission to modify this category.', 403, 'FORBIDDEN');
    }

    if (input.name && input.name.toLowerCase() !== category.name.toLowerCase()) {
      const existing = await categoryRepository.findByNameAndType(
        userId,
        input.name,
        input.type || category.type
      );
      if (existing && existing.id !== categoryId) {
        throw new AppError('Another category with this name already exists.', 409, 'DUPLICATE_CATEGORY');
      }
    }

    const updated = await categoryRepository.update(categoryId, input);
    if (!updated) {
      throw new AppError('Failed to update category.', 500, 'UPDATE_FAILED');
    }
    return updated;
  }

  async deleteCategory(userId: string, categoryId: string): Promise<void> {
    const category = await categoryRepository.findById(categoryId);
    if (!category) {
      throw new AppError('Category not found.', 404, 'NOT_FOUND');
    }

    if (category.isDefault) {
      throw new AppError('System default categories cannot be deleted.', 400, 'CANNOT_DELETE_DEFAULT_CATEGORY');
    }

    if (category.userId !== userId) {
      throw new AppError('You do not have permission to delete this category.', 403, 'FORBIDDEN');
    }

    const linkedCount = await categoryRepository.countLinkedTransactions(categoryId);
    if (linkedCount > 0) {
      throw new AppError(
        `Cannot delete category "${category.name}" because it is linked to ${linkedCount} transaction(s). Reassign or delete transactions first.`,
        400,
        'CATEGORY_IN_USE'
      );
    }

    await categoryRepository.delete(categoryId);
  }
}

export const categoryService = new CategoryService();
