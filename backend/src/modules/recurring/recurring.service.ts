import {
  CreateRecurringInput,
  UpdateRecurringInput,
  RecurringQueryParams,
} from './recurring.schema.js';
import {
  recurringRepository,
  RecurringRuleRecord,
} from './recurring.repository.js';
import { categoryRepository } from '../categories/category.repository.js';
import { transactionRepository } from '../transactions/transaction.repository.js';
import { AppError } from '../../middlewares/errorHandler.js';
import { paiseToRupees, formatINR } from '../../utils/money.js';

export interface FormattedRecurringRule extends RecurringRuleRecord {
  amountRupees: number;
  amountFormatted: string;
}

export class RecurringService {
  private formatRule(rule: RecurringRuleRecord): FormattedRecurringRule {
    return {
      ...rule,
      amountRupees: paiseToRupees(rule.amount),
      amountFormatted: formatINR(rule.amount),
    };
  }

  calculateNextDueDate(from: Date, frequency: string, interval: number = 1): Date {
    const next = new Date(from.getTime());
    const step = Math.max(1, interval);

    switch (frequency) {
      case 'daily':
        next.setDate(next.getDate() + step);
        break;
      case 'weekly':
        next.setDate(next.getDate() + (step * 7));
        break;
      case 'monthly': {
        const targetMonth = next.getMonth() + step;
        const targetDay = next.getDate();
        next.setMonth(targetMonth);
        // Handle month end overflows (e.g. Jan 31 + 1 month -> Feb 28/29)
        if (next.getDate() !== targetDay) {
          next.setDate(0); // set to last day of target month
        }
        break;
      }
      case 'yearly': {
        next.setFullYear(next.getFullYear() + step);
        break;
      }
      default:
        next.setMonth(next.getMonth() + step);
    }

    return next;
  }

  async create(userId: string, input: CreateRecurringInput): Promise<FormattedRecurringRule> {
    const category = await categoryRepository.findById(input.categoryId);
    if (!category) {
      throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
    }

    const startDate = input.startDate || new Date();
    const nextDueDate = input.nextDueDate || startDate;

    const created = await recurringRepository.create({
      userId,
      title: input.title,
      amount: input.amount,
      categoryId: input.categoryId,
      frequency: input.frequency,
      interval: input.interval,
      nextDueDate,
      endDate: input.endDate,
      paymentMethod: input.paymentMethod,
      autoRecord: input.autoRecord,
      isActive: input.isActive,
    });

    return this.formatRule(created);
  }

  async list(userId: string, params?: RecurringQueryParams): Promise<FormattedRecurringRule[]> {
    const rules = await recurringRepository.findByUserId(userId, params);
    return rules.map(r => this.formatRule(r));
  }

  async getById(userId: string, id: string): Promise<FormattedRecurringRule> {
    const rule = await recurringRepository.findById(id);
    if (!rule) {
      throw new AppError('Recurring rule not found', 404, 'NOT_FOUND');
    }
    if (rule.userId !== userId) {
      throw new AppError('You do not have permission to view this recurring rule', 403, 'FORBIDDEN');
    }
    return this.formatRule(rule);
  }

  async update(
    userId: string,
    id: string,
    input: UpdateRecurringInput
  ): Promise<FormattedRecurringRule> {
    const existing = await this.getById(userId, id);

    if (input.categoryId && input.categoryId !== existing.categoryId) {
      const category = await categoryRepository.findById(input.categoryId);
      if (!category) {
        throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
      }
    }

    const updated = await recurringRepository.update(id, {
      ...input,
    });

    if (!updated) {
      throw new AppError('Failed to update recurring rule', 500, 'UPDATE_FAILED');
    }

    return this.formatRule(updated);
  }

  async delete(userId: string, id: string): Promise<void> {
    await this.getById(userId, id);
    const deleted = await recurringRepository.delete(id);
    if (!deleted) {
      throw new AppError('Recurring rule not found', 404, 'NOT_FOUND');
    }
  }

  /**
   * Idempotent recurring transaction runner.
   * Can be triggered on demand or on schedule.
   * Finds active rules where nextDueDate <= now, creates corresponding transactions,
   * and advances nextDueDate without creating duplicate transactions on the same due cycle.
   */
  async processDueRules(userId?: string): Promise<{
    processedCount: number;
    createdTransactions: number;
    details: Array<{
      ruleId: string;
      title: string;
      amountFormatted: string;
      transactionId?: string;
      skippedDuplicate: boolean;
      newNextDueDate: string;
      isActive: boolean;
    }>;
  }> {
    const now = new Date();
    const dueRules = await recurringRepository.findDueRules(now, userId);

    let createdCount = 0;
    const details = [];

    for (const rule of dueRules) {
      const dueStart = new Date(rule.nextDueDate);
      dueStart.setHours(0, 0, 0, 0);
      const dueEnd = new Date(rule.nextDueDate);
      dueEnd.setHours(23, 59, 59, 999);

      // Check if a transaction has already been recorded for this rule on this due date cycle
      const existingTxns = await transactionRepository.list(rule.userId, {
        startDate: dueStart.toISOString(),
        endDate: dueEnd.toISOString(),
        limit: 50,
      });

      const alreadyRecorded = existingTxns.items.some(
        tx => tx.recurringRuleId === rule.id
      );

      let createdTxnId: string | undefined;

      if (!alreadyRecorded && rule.autoRecord) {
        // Create the transaction
        const txn = await transactionRepository.create({
          userId: rule.userId,
          type: 'expense',
          amount: rule.amount,
          categoryId: rule.categoryId,
          title: rule.title,
          merchant: rule.title,
          note: `Recurring payment (${rule.frequency})`,
          transactionDate: rule.nextDueDate,
          paymentMethod: rule.paymentMethod || 'UPI',
          isRecurring: true,
          recurringRuleId: rule.id,
        });
        createdTxnId = txn.id;
        createdCount++;
      }

      // Advance nextDueDate
      let nextDue = this.calculateNextDueDate(rule.nextDueDate, rule.frequency, rule.interval);
      let isActive = rule.isActive;

      if (rule.endDate && nextDue > rule.endDate) {
        isActive = false;
      }

      await recurringRepository.update(rule.id, {
        nextDueDate: nextDue,
        isActive,
      });

      details.push({
        ruleId: rule.id,
        title: rule.title,
        amountFormatted: formatINR(rule.amount),
        transactionId: createdTxnId,
        skippedDuplicate: alreadyRecorded,
        newNextDueDate: nextDue.toISOString(),
        isActive,
      });
    }

    return {
      processedCount: dueRules.length,
      createdTransactions: createdCount,
      details,
    };
  }
}

export const recurringService = new RecurringService();
