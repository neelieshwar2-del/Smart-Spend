import { Request, Response, NextFunction } from 'express';
import { budgetService } from './budget.service.js';
import { dashboardService } from './dashboard.service.js';
import { createBudgetSchema, updateBudgetSchema } from './budget.schema.js';
import { ApiResponse } from '../../types/index.js';

export class BudgetController {
  async list(req: Request, res: Response<ApiResponse<any>>, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const budgets = await budgetService.listBudgets(userId);

      res.status(200).json({
        success: true,
        data: budgets,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response<ApiResponse<any>>, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const budget = await budgetService.getBudgetById(userId, req.params.id);

      res.status(200).json({
        success: true,
        data: budget,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response<ApiResponse<any>>, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const validated = createBudgetSchema.parse(req.body);
      const budget = await budgetService.createBudget(userId, validated);

      res.status(201).json({
        success: true,
        message: 'Budget created successfully.',
        data: budget,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response<ApiResponse<any>>, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const validated = updateBudgetSchema.parse(req.body);
      const budget = await budgetService.updateBudget(userId, req.params.id, validated);

      res.status(200).json({
        success: true,
        message: 'Budget updated successfully.',
        data: budget,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response<ApiResponse<any>>, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      await budgetService.deleteBudget(userId, req.params.id);

      res.status(200).json({
        success: true,
        message: 'Budget deleted successfully.',
        data: { deleted: true },
      });
    } catch (error) {
      next(error);
    }
  }

  async getSummary(req: Request, res: Response<ApiResponse<any>>, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const summary = await budgetService.getBudgetSummary(userId);

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDashboard(req: Request, res: Response<ApiResponse<any>>, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const dashboard = await dashboardService.getDashboardData(userId);

      res.status(200).json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const budgetController = new BudgetController();
