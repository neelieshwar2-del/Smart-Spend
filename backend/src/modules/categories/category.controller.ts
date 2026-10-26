import { Request, Response, NextFunction } from 'express';
import { categoryService } from './category.service.js';
import { createCategorySchema, updateCategorySchema } from './category.schema.js';
import { ApiResponse } from '../../types/index.js';

export class CategoryController {
  async list(req: Request, res: Response<ApiResponse<any>>, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const categories = await categoryService.listCategories(userId);

      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response<ApiResponse<any>>, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const category = await categoryService.getCategoryById(userId, req.params.id);

      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response<ApiResponse<any>>, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const validated = createCategorySchema.parse(req.body);
      const category = await categoryService.createCategory(userId, validated);

      res.status(201).json({
        success: true,
        message: 'Category created successfully.',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response<ApiResponse<any>>, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const validated = updateCategorySchema.parse(req.body);
      const category = await categoryService.updateCategory(userId, req.params.id, validated);

      res.status(200).json({
        success: true,
        message: 'Category updated successfully.',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response<ApiResponse<any>>, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      await categoryService.deleteCategory(userId, req.params.id);

      res.status(200).json({
        success: true,
        message: 'Category deleted successfully.',
        data: { deleted: true },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();
