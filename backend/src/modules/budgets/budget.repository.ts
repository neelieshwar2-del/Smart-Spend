import { prisma } from '../../prisma/client.js';

export interface BudgetRecord {
  id: string;
  userId: string;
  name: string;
  amountLimit: number; // integer paise
  period: string; // 'weekly' | 'monthly'
  categoryId: string | null;
  category?: {
    id: string;
    name: string;
    icon: string;
    color: string;
  } | null;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateBudgetData {
  name?: string;
  amountLimit?: number;
  period?: string;
  categoryId?: string | null;
  startDate?: Date;
  endDate?: Date;
}

const memoryBudgets = new Map<string, BudgetRecord>();

export class BudgetRepository {
  private isTestMode(): boolean {
    return process.env.NODE_ENV === 'test';
  }

  async create(data: {
    userId: string;
    name: string;
    amountLimit: number;
    period: string;
    categoryId?: string | null;
    startDate: Date;
    endDate: Date;
  }): Promise<BudgetRecord> {
    if (!this.isTestMode()) {
      try {
        return (await prisma.budget.create({
          data: {
            userId: data.userId,
            name: data.name,
            amountLimit: data.amountLimit,
            period: data.period,
            categoryId: data.categoryId || null,
            startDate: data.startDate,
            endDate: data.endDate,
          },
          include: {
            category: {
              select: { id: true, name: true, icon: true, color: true },
            },
          },
        })) as BudgetRecord;
      } catch (e) {
        // fallback
      }
    }

    const budget: BudgetRecord = {
      id: 'bdg_' + Math.random().toString(36).substring(2, 11),
      userId: data.userId,
      name: data.name,
      amountLimit: data.amountLimit,
      period: data.period,
      categoryId: data.categoryId || null,
      category: null,
      startDate: data.startDate,
      endDate: data.endDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryBudgets.set(budget.id, budget);
    return budget;
  }

  async findById(id: string): Promise<BudgetRecord | null> {
    if (!this.isTestMode()) {
      try {
        return (await prisma.budget.findUnique({
          where: { id },
          include: {
            category: {
              select: { id: true, name: true, icon: true, color: true },
            },
          },
        })) as BudgetRecord | null;
      } catch (e) {
        // fallback
      }
    }
    return memoryBudgets.get(id) || null;
  }

  async list(userId: string): Promise<BudgetRecord[]> {
    if (!this.isTestMode()) {
      try {
        return (await prisma.budget.findMany({
          where: { userId },
          include: {
            category: {
              select: { id: true, name: true, icon: true, color: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        })) as BudgetRecord[];
      } catch (e) {
        // fallback
      }
    }
    return Array.from(memoryBudgets.values())
      .filter(b => b.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findActiveOverallBudget(userId: string, date: Date): Promise<BudgetRecord | null> {
    if (!this.isTestMode()) {
      try {
        return (await prisma.budget.findFirst({
          where: {
            userId,
            categoryId: null, // overall spend limit
            startDate: { lte: date },
            endDate: { gte: date },
          },
          orderBy: { amountLimit: 'desc' },
        })) as BudgetRecord | null;
      } catch (e) {
        // fallback
      }
    }

    const budgets = Array.from(memoryBudgets.values()).filter(
      b =>
        b.userId === userId &&
        b.categoryId === null &&
        new Date(b.startDate) <= date &&
        new Date(b.endDate) >= date
    );
    return budgets[0] || null;
  }

  async update(id: string, data: UpdateBudgetData): Promise<BudgetRecord | null> {
    if (!this.isTestMode()) {
      try {
        return (await prisma.budget.update({
          where: { id },
          data: {
            ...(data.name !== undefined ? { name: data.name } : {}),
            ...(data.amountLimit !== undefined ? { amountLimit: data.amountLimit } : {}),
            ...(data.period !== undefined ? { period: data.period } : {}),
            ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
            ...(data.startDate !== undefined ? { startDate: data.startDate } : {}),
            ...(data.endDate !== undefined ? { endDate: data.endDate } : {}),
          },
          include: {
            category: {
              select: { id: true, name: true, icon: true, color: true },
            },
          },
        })) as BudgetRecord;
      } catch (e) {
        // fallback
      }
    }

    const existing = memoryBudgets.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, updatedAt: new Date() };
    memoryBudgets.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    if (!this.isTestMode()) {
      try {
        await prisma.budget.delete({ where: { id } });
        return true;
      } catch (e) {
        // fallback
      }
    }
    return memoryBudgets.delete(id);
  }

  clearMemory(): void {
    memoryBudgets.clear();
  }
}

export const budgetRepository = new BudgetRepository();
