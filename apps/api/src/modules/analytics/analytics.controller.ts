import { Request, Response, NextFunction } from 'express';
import { analyticsService } from './analytics.service.js';
import {
  analyticsQuerySchema,
  trailingMonthsQuerySchema,
  trendsQuerySchema,
} from './analytics.schema.js';

export class AnalyticsController {
  async getOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = analyticsQuerySchema.parse(req.query);
      const data = await analyticsService.getOverview(req.user!.userId, query);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDaily(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = analyticsQuerySchema.parse(req.query);
      const data = await analyticsService.getDaily(req.user!.userId, query);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMonthly(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = trailingMonthsQuerySchema.parse(req.query);
      const data = await analyticsService.getMonthly(req.user!.userId, query);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = analyticsQuerySchema.parse(req.query);
      const data = await analyticsService.getCategories(req.user!.userId, query);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTrends(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = trendsQuerySchema.parse(req.query);
      const data = await analyticsService.getTrends(req.user!.userId, query);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCashFlow(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = trailingMonthsQuerySchema.parse(req.query);
      const data = await analyticsService.getCashFlow(req.user!.userId, query);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
