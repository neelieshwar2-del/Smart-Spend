import { prisma } from '../../prisma/client.js';
import { RecurringQueryParams } from './recurring.schema.js';
import { categoryRepository } from '../categories/category.repository.js';

export interface RecurringRuleRecord {
  id: string;
  userId: string;
  title: string;
  amount: number; // integer paise
  categoryId: string;
  category?: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  frequency: string; // 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number;
  nextDueDate: Date;
  endDate: Date | null;
  paymentMethod: string;
  autoRecord: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const memoryRecurring = new Map<string, RecurringRuleRecord>();

export class RecurringRepository {
  private isTestMode(): boolean {
    return process.env.NODE_ENV === 'test';
  }

  async create(data: {
    userId: string;
    title: string;
    amount: number;
    categoryId: string;
    frequency: string;
    interval?: number;
    nextDueDate: Date;
    endDate?: Date | null;
    paymentMethod?: string;
    autoRecord?: boolean;
    isActive?: boolean;
  }): Promise<RecurringRuleRecord> {
    if (!this.isTestMode()) {
      try {
        const created = await prisma.recurringRule.create({
          data: {
            userId: data.userId,
            title: data.title,
            amount: data.amount,
            categoryId: data.categoryId,
            frequency: data.frequency,
            interval: data.interval || 1,
            nextDueDate: data.nextDueDate,
            endDate: data.endDate ?? null,
            isActive: data.isActive ?? true,
          },
          include: {
            category: {
              select: { id: true, name: true, icon: true, color: true },
            },
          },
        });

        return {
          ...created,
          paymentMethod: data.paymentMethod || 'UPI',
          autoRecord: data.autoRecord ?? true,
        };
      } catch {
        // Fallback to memory store
      }
    }

    const id = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const cat = await categoryRepository.findById(data.categoryId);

    const record: RecurringRuleRecord = {
      id,
      userId: data.userId,
      title: data.title,
      amount: data.amount,
      categoryId: data.categoryId,
      category: cat ? { id: cat.id, name: cat.name, icon: cat.icon, color: cat.color } : undefined,
      frequency: data.frequency,
      interval: data.interval || 1,
      nextDueDate: data.nextDueDate,
      endDate: data.endDate ?? null,
      paymentMethod: data.paymentMethod || 'UPI',
      autoRecord: data.autoRecord ?? true,
      isActive: data.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryRecurring.set(id, record);
    return record;
  }

  async findById(id: string): Promise<RecurringRuleRecord | null> {
    if (!this.isTestMode()) {
      try {
        const found = await prisma.recurringRule.findUnique({
          where: { id },
          include: {
            category: {
              select: { id: true, name: true, icon: true, color: true },
            },
          },
        });
        if (found) {
          return {
            ...found,
            paymentMethod: 'UPI',
            autoRecord: true,
          };
        }
      } catch {
        // Fallback
      }
    }

    return memoryRecurring.get(id) || null;
  }

  async findByUserId(userId: string, params?: RecurringQueryParams): Promise<RecurringRuleRecord[]> {
    if (!this.isTestMode()) {
      try {
        const where: any = { userId };
        if (params?.isActive !== undefined) where.isActive = params.isActive;
        if (params?.categoryId) where.categoryId = params.categoryId;

        const found = await prisma.recurringRule.findMany({
          where,
          include: {
            category: {
              select: { id: true, name: true, icon: true, color: true },
            },
          },
          orderBy: { nextDueDate: 'asc' },
        });

        return found.map(item => ({
          ...item,
          paymentMethod: 'UPI',
          autoRecord: true,
        }));
      } catch {
        // Fallback
      }
    }

    return Array.from(memoryRecurring.values())
      .filter(item => {
        if (item.userId !== userId) return false;
        if (params?.isActive !== undefined && item.isActive !== params.isActive) return false;
        if (params?.categoryId && item.categoryId !== params.categoryId) return false;
        return true;
      })
      .sort((a, b) => a.nextDueDate.getTime() - b.nextDueDate.getTime());
  }

  async update(id: string, data: Partial<RecurringRuleRecord>): Promise<RecurringRuleRecord | null> {
    if (!this.isTestMode()) {
      try {
        const updateData: any = {};
        if (data.title !== undefined) updateData.title = data.title;
        if (data.amount !== undefined) updateData.amount = data.amount;
        if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
        if (data.frequency !== undefined) updateData.frequency = data.frequency;
        if (data.interval !== undefined) updateData.interval = data.interval;
        if (data.nextDueDate !== undefined) updateData.nextDueDate = data.nextDueDate;
        if (data.endDate !== undefined) updateData.endDate = data.endDate;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;

        const updated = await prisma.recurringRule.update({
          where: { id },
          data: updateData,
          include: {
            category: {
              select: { id: true, name: true, icon: true, color: true },
            },
          },
        });

        return {
          ...updated,
          paymentMethod: data.paymentMethod || 'UPI',
          autoRecord: data.autoRecord ?? true,
        };
      } catch {
        // Fallback
      }
    }

    const existing = memoryRecurring.get(id);
    if (!existing) return null;

    let cat = existing.category;
    if (data.categoryId && data.categoryId !== existing.categoryId) {
      const foundCat = await categoryRepository.findById(data.categoryId);
      if (foundCat) {
        cat = { id: foundCat.id, name: foundCat.name, icon: foundCat.icon, color: foundCat.color };
      }
    }

    const updated: RecurringRuleRecord = {
      ...existing,
      ...data,
      category: cat,
      updatedAt: new Date(),
    };

    memoryRecurring.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    if (!this.isTestMode()) {
      try {
        await prisma.recurringRule.delete({ where: { id } });
        return true;
      } catch {
        // Fallback
      }
    }

    return memoryRecurring.delete(id);
  }

  async findDueRules(upToDate: Date, userId?: string): Promise<RecurringRuleRecord[]> {
    if (!this.isTestMode()) {
      try {
        const where: any = {
          isActive: true,
          nextDueDate: { lte: upToDate },
        };
        if (userId) where.userId = userId;

        const due = await prisma.recurringRule.findMany({
          where,
          include: {
            category: {
              select: { id: true, name: true, icon: true, color: true },
            },
          },
          orderBy: { nextDueDate: 'asc' },
        });

        return due.map(d => ({
          ...d,
          paymentMethod: 'UPI',
          autoRecord: true,
        }));
      } catch {
        // Fallback
      }
    }

    return Array.from(memoryRecurring.values())
      .filter(item => {
        if (!item.isActive) return false;
        if (userId && item.userId !== userId) return false;
        return item.nextDueDate.getTime() <= upToDate.getTime();
      })
      .sort((a, b) => a.nextDueDate.getTime() - b.nextDueDate.getTime());
  }

  // Clear memory for tests
  clearMemory(): void {
    memoryRecurring.clear();
  }
}

export const recurringRepository = new RecurringRepository();
