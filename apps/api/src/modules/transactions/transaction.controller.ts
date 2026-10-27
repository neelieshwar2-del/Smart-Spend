import { Request, Response, NextFunction } from 'express';
import { transactionService } from './transaction.service.js';
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionQuerySchema,
} from './transaction.schema.js';
import { ApiResponse } from '../../types/index.js';

export class TransactionController {
  async list(req: Request, res: Response<ApiResponse<any>>, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const queryParams = transactionQuerySchema.parse(req.query);
      const result = await transactionService.listTransactions(userId, queryParams);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response<ApiResponse<any>>, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const transaction = await transactionService.getTransactionById(userId, req.params.id);

      res.status(200).json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response<ApiResponse<any>>, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const validated = createTransactionSchema.parse(req.body);
      const transaction = await transactionService.createTransaction(userId, validated);

      res.status(201).json({
        success: true,
        message: 'Transaction recorded successfully.',
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response<ApiResponse<any>>, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const validated = updateTransactionSchema.parse(req.body);
      const transaction = await transactionService.updateTransaction(
        userId,
        req.params.id,
        validated
      );

      res.status(200).json({
        success: true,
        message: 'Transaction updated successfully.',
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response<ApiResponse<any>>, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      await transactionService.deleteTransaction(userId, req.params.id);

      res.status(200).json({
        success: true,
        message: 'Transaction deleted successfully.',
        data: { deleted: true },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const transactionController = new TransactionController();
