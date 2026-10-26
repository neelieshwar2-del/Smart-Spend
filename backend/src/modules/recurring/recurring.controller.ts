import { Request, Response, NextFunction } from 'express';
import { recurringService } from './recurring.service.js';
import {
  createRecurringSchema,
  updateRecurringSchema,
  recurringQuerySchema,
} from './recurring.schema.js';

export class RecurringController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createRecurringSchema.parse(req.body);
      const rule = await recurringService.create(req.user!.userId, validated);

      res.status(201).json({
        success: true,
        message: 'Recurring rule created successfully',
        data: rule,
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = recurringQuerySchema.parse(req.query);
      const rules = await recurringService.list(req.user!.userId, query);

      res.status(200).json({
        success: true,
        data: rules,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rule = await recurringService.getById(req.user!.userId, req.params.id);

      res.status(200).json({
        success: true,
        data: rule,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = updateRecurringSchema.parse(req.body);
      const rule = await recurringService.update(req.user!.userId, req.params.id, validated);

      res.status(200).json({
        success: true,
        message: 'Recurring rule updated successfully',
        data: rule,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await recurringService.delete(req.user!.userId, req.params.id);

      res.status(200).json({
        success: true,
        message: 'Recurring rule deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async processDue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await recurringService.processDueRules(req.user!.userId);

      res.status(200).json({
        success: true,
        message: `Processed ${result.processedCount} rules; created ${result.createdTransactions} transactions`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const recurringController = new RecurringController();
