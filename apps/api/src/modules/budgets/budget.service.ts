import { budgetRepository, BudgetRecord } from './budget.repository.js';
import { transactionRepository } from '../transactions/transaction.repository.js';
import { categoryRepository } from '../categories/category.repository.js';
import { CreateBudgetInput, UpdateBudgetInput } from './budget.schema.js';
import { paiseToRupees, formatINR } from '../../utils/money.js';
import { AppError } from '../../middlewares/errorHandler.js';

export interface FormattedBudget extends BudgetRecord {
  amountLimitRupees: number;
  amountLimitFormatted: string;
}

export interface BudgetSummary {
  hasBudget: boolean;
  budget?: {
    id: string;
    name: string;
    period: string;
    startDate: Date;
    endDate: Date;
    amountLimit: number;
    amountLimitRupees: number;
    amountLimitFormatted: string;
    totalSpent: number;
    totalSpentRupees: number;
    totalSpentFormatted: string;
    remaining: number;
    remainingRupees: number;
    remainingFormatted: string;
    percentageUsed: number;
    percentageLeft: number;
    daysRemaining: number;
    dailyAllowance: number;
    dailyAllowanceRupees: number;
    dailyAllowanceFormatted: string;
    warningStatus: 'safe' | 'warning' | 'critical' | 'exceeded';
  };
  categoryBudgets?: any[];
  message?: string;
}

export class BudgetService {
  private formatBudget(b: BudgetRecord): FormattedBudget {
    return {
      ...b,
      amountLimitRupees: paiseToRupees(b.amountLimit),
      amountLimitFormatted: formatINR(b.amountLimit),
    };
  }

  async createBudget(userId: string, input: CreateBudgetInput): Promise<FormattedBudget> {
    if (input.categoryId) {
      const cat = await categoryRepository.findById(input.categoryId);
      if (!cat) {
        throw new AppError('The specified category does not exist.', 404, 'CATEGORY_NOT_FOUND');
      }
    }

    const budget = await budgetRepository.create({
      userId,
      name: input.name,
      amountLimit: input.amountLimit,
      period: input.period,
      categoryId: input.categoryId,
      startDate: input.startDate,
      endDate: input.endDate,
    });

    return this.formatBudget(budget);
  }

  async getBudgetById(userId: string, id: string): Promise<FormattedBudget> {
    const budget = await budgetRepository.findById(id);
    if (!budget) {
      throw new AppError('Budget not found.', 404, 'NOT_FOUND');
    }

    if (budget.userId !== userId) {
      throw new AppError('Access denied.', 403, 'FORBIDDEN');
    }

    return this.formatBudget(budget);
  }

  async listBudgets(userId: string): Promise<FormattedBudget[]> {
    const budgets = await budgetRepository.list(userId);
    return budgets.map(b => this.formatBudget(b));
  }

  async updateBudget(
    userId: string,
    id: string,
    input: UpdateBudgetInput
  ): Promise<FormattedBudget> {
    const budget = await budgetRepository.findById(id);
    if (!budget) {
      throw new AppError('Budget not found.', 404, 'NOT_FOUND');
    }

    if (budget.userId !== userId) {
      throw new AppError('Access denied.', 403, 'FORBIDDEN');
    }

    const updated = await budgetRepository.update(id, input);
    if (!updated) {
      throw new AppError('Failed to update budget.', 500, 'UPDATE_FAILED');
    }

    return this.formatBudget(updated);
  }

  async deleteBudget(userId: string, id: string): Promise<void> {
    const budget = await budgetRepository.findById(id);
    if (!budget) {
      throw new AppError('Budget not found.', 404, 'NOT_FOUND');
    }

    if (budget.userId !== userId) {
      throw new AppError('Access denied.', 403, 'FORBIDDEN');
    }

    await budgetRepository.delete(id);
  }

  async getBudgetSummary(userId: string): Promise<BudgetSummary> {
    const now = new Date();
    const activeBudget = await budgetRepository.findActiveOverallBudget(userId, now);

    if (!activeBudget) {
      return {
        hasBudget: false,
        message: 'No active spending limit configured for this period.',
      };
    }

    // Get all transactions for user in this budget window
    const txnsResult = await transactionRepository.list(userId, {
      startDate: activeBudget.startDate.toISOString(),
      endDate: activeBudget.endDate.toISOString(),
      type: 'expense',
      limit: 1000,
      sortBy: 'transactionDate',
      sortOrder: 'desc',
      page: 1,
    });

    let totalSpent = 0;
    for (const t of txnsResult.items) {
      totalSpent += t.amount;
    }

    const limit = activeBudget.amountLimit;
    const remaining = Math.max(0, limit - totalSpent);
    const percentageUsed = Math.min(100, Math.round((totalSpent / limit) * 100));
    const percentageLeft = Math.max(0, 100 - percentageUsed);

    // Calculate remaining days
    const endMs = new Date(activeBudget.endDate).getTime();
    const nowMs = now.getTime();
    const diffMs = Math.max(0, endMs - nowMs);
    const daysRemaining = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    // Daily allowance formula: Remaining period budget / remaining days
    const dailyAllowance = Math.round(remaining / daysRemaining);

    let warningStatus: 'safe' | 'warning' | 'critical' | 'exceeded' = 'safe';
    if (totalSpent >= limit) {
      warningStatus = 'exceeded';
    } else if (percentageUsed >= 90) {
      warningStatus = 'critical';
    } else if (percentageUsed >= 75) {
      warningStatus = 'warning';
    }

    return {
      hasBudget: true,
      budget: {
        id: activeBudget.id,
        name: activeBudget.name,
        period: activeBudget.period,
        startDate: activeBudget.startDate,
        endDate: activeBudget.endDate,
        amountLimit: limit,
        amountLimitRupees: paiseToRupees(limit),
        amountLimitFormatted: formatINR(limit),
        totalSpent,
        totalSpentRupees: paiseToRupees(totalSpent),
        totalSpentFormatted: formatINR(totalSpent),
        remaining,
        remainingRupees: paiseToRupees(remaining),
        remainingFormatted: formatINR(remaining),
        percentageUsed,
        percentageLeft,
        daysRemaining,
        dailyAllowance,
        dailyAllowanceRupees: paiseToRupees(dailyAllowance),
        dailyAllowanceFormatted: formatINR(dailyAllowance),
        warningStatus,
      },
    };
  }
}

export const budgetService = new BudgetService();
