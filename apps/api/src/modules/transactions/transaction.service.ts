import { transactionRepository, TransactionRecord } from './transaction.repository.js';
import { categoryRepository } from '../categories/category.repository.js';
import {
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionQueryParams,
} from './transaction.schema.js';
import { paiseToRupees, formatINR } from '../../utils/money.js';
import { AppError } from '../../middlewares/errorHandler.js';
import { PaginatedResult } from '../../types/index.js';

export interface FormattedTransaction extends TransactionRecord {
  amountRupees: number;
  amountFormatted: string;
}

export class TransactionService {
  private formatTransaction(txn: TransactionRecord): FormattedTransaction {
    return {
      ...txn,
      amountRupees: paiseToRupees(txn.amount),
      amountFormatted: formatINR(txn.amount),
    };
  }

  async createTransaction(
    userId: string,
    input: CreateTransactionInput
  ): Promise<FormattedTransaction> {
    // 1. Verify category existence and accessibility
    const category = await categoryRepository.findById(input.categoryId);
    if (!category) {
      throw new AppError('The specified category does not exist.', 404, 'CATEGORY_NOT_FOUND');
    }

    if (category.userId && category.userId !== userId && !category.isDefault) {
      throw new AppError('Access to the specified category is denied.', 403, 'FORBIDDEN');
    }

    // 2. Persist transaction (amount is guaranteed integer paise)
    const record = await transactionRepository.create({
      userId,
      type: input.type,
      amount: input.amount,
      categoryId: input.categoryId,
      title: input.title,
      merchant: input.merchant || input.title,
      note: input.note,
      transactionDate: input.transactionDate || new Date(),
      paymentMethod: input.paymentMethod || 'UPI',
      isRecurring: input.isRecurring,
      recurringRuleId: input.recurringRuleId,
    });

    return this.formatTransaction({
      ...record,
      category: {
        id: category.id,
        name: category.name,
        icon: category.icon,
        color: category.color,
      },
    });
  }

  async getTransactionById(userId: string, transactionId: string): Promise<FormattedTransaction> {
    const record = await transactionRepository.findById(transactionId);
    if (!record) {
      throw new AppError('Transaction not found.', 404, 'NOT_FOUND');
    }

    if (record.userId !== userId) {
      throw new AppError('You do not have permission to access this transaction.', 403, 'FORBIDDEN');
    }

    return this.formatTransaction(record);
  }

  async listTransactions(
    userId: string,
    params: TransactionQueryParams
  ): Promise<PaginatedResult<FormattedTransaction>> {
    const result = await transactionRepository.list(userId, params);

    return {
      items: result.items.map(item => this.formatTransaction(item)),
      pagination: result.pagination,
    };
  }

  async updateTransaction(
    userId: string,
    transactionId: string,
    input: UpdateTransactionInput
  ): Promise<FormattedTransaction> {
    const record = await transactionRepository.findById(transactionId);
    if (!record) {
      throw new AppError('Transaction not found.', 404, 'NOT_FOUND');
    }

    if (record.userId !== userId) {
      throw new AppError('You do not have permission to modify this transaction.', 403, 'FORBIDDEN');
    }

    if (input.categoryId && input.categoryId !== record.categoryId) {
      const category = await categoryRepository.findById(input.categoryId);
      if (!category) {
        throw new AppError('The specified category does not exist.', 404, 'CATEGORY_NOT_FOUND');
      }
      if (category.userId && category.userId !== userId && !category.isDefault) {
        throw new AppError('Access to the specified category is denied.', 403, 'FORBIDDEN');
      }
    }

    const updated = await transactionRepository.update(transactionId, input);
    if (!updated) {
      throw new AppError('Failed to update transaction.', 500, 'UPDATE_FAILED');
    }

    return this.formatTransaction(updated);
  }

  async deleteTransaction(userId: string, transactionId: string): Promise<void> {
    const record = await transactionRepository.findById(transactionId);
    if (!record) {
      throw new AppError('Transaction not found.', 404, 'NOT_FOUND');
    }

    if (record.userId !== userId) {
      throw new AppError('You do not have permission to delete this transaction.', 403, 'FORBIDDEN');
    }

    await transactionRepository.delete(transactionId);
  }
}

export const transactionService = new TransactionService();
