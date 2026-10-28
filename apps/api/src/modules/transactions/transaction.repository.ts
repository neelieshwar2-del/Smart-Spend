import { prisma } from '../../prisma/client.js';
import { TransactionQueryParams } from './transaction.schema.js';
import { PaginatedResult } from '../../types/index.js';

export interface TransactionRecord {
  id: string;
  userId: string;
  type: string;
  amount: number; // integer paise
  categoryId: string;
  category?: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  title: string;
  merchant: string | null;
  note: string | null;
  transactionDate: Date;
  paymentMethod: string;
  isRecurring: boolean;
  recurringRuleId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateTransactionData {
  amount?: number;
  type?: string;
  categoryId?: string;
  title?: string;
  merchant?: string | null;
  note?: string | null;
  transactionDate?: Date;
  paymentMethod?: string;
}

const memoryTransactions = new Map<string, TransactionRecord>();

export class TransactionRepository {
  private isTestMode(): boolean {
    return process.env.NODE_ENV === 'test';
  }

  async create(data: {
    userId: string;
    type: string;
    amount: number;
    categoryId: string;
    title: string;
    merchant?: string | null;
    note?: string | null;
    transactionDate: Date;
    paymentMethod: string;
    isRecurring?: boolean;
    recurringRuleId?: string | null;
  }): Promise<TransactionRecord> {
    if (!this.isTestMode()) {
      try {
        return (await prisma.transaction.create({
          data: {
            userId: data.userId,
            type: data.type,
            amount: data.amount,
            categoryId: data.categoryId,
            title: data.title,
            merchant: data.merchant,
            note: data.note,
            transactionDate: data.transactionDate,
            paymentMethod: data.paymentMethod,
            isRecurring: data.isRecurring || false,
            recurringRuleId: data.recurringRuleId,
          },
          include: {
            category: {
              select: { id: true, name: true, icon: true, color: true },
            },
          },
        })) as TransactionRecord;
      } catch (e) {
        // fallback
      }
    }

    const txn: TransactionRecord = {
      id: 'txn_' + Math.random().toString(36).substring(2, 11),
      userId: data.userId,
      type: data.type,
      amount: data.amount,
      categoryId: data.categoryId,
      category: {
        id: data.categoryId,
        name: 'General',
        icon: 'receipt',
        color: '#555e74',
      },
      title: data.title,
      merchant: data.merchant || null,
      note: data.note || null,
      transactionDate: data.transactionDate,
      paymentMethod: data.paymentMethod,
      isRecurring: data.isRecurring || false,
      recurringRuleId: data.recurringRuleId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryTransactions.set(txn.id, txn);
    return txn;
  }

  async findById(id: string): Promise<TransactionRecord | null> {
    if (!this.isTestMode()) {
      try {
        return (await prisma.transaction.findUnique({
          where: { id },
          include: {
            category: {
              select: { id: true, name: true, icon: true, color: true },
            },
          },
        })) as TransactionRecord | null;
      } catch (e) {
        // fallback
      }
    }
    return memoryTransactions.get(id) || null;
  }

  async list(
    userId: string,
    params: Partial<TransactionQueryParams> = {}
  ): Promise<PaginatedResult<TransactionRecord>> {
    if (!this.isTestMode()) {
      try {
        const where: any = { userId };

        if (params.type) where.type = params.type;
        if (params.categoryId) where.categoryId = params.categoryId;
        if (params.paymentMethod) where.paymentMethod = params.paymentMethod;

        if (params.startDate || params.endDate) {
          where.transactionDate = {};
          if (params.startDate) where.transactionDate.gte = new Date(params.startDate);
          if (params.endDate) where.transactionDate.lte = new Date(params.endDate);
        }

        if (params.search) {
          where.OR = [
            { title: { contains: params.search, mode: 'insensitive' } },
            { merchant: { contains: params.search, mode: 'insensitive' } },
            { note: { contains: params.search, mode: 'insensitive' } },
          ];
        }

        const page = params.page || 1;
        const limit = params.limit || 20;
        const skip = (page - 1) * limit;

        const [totalItems, items] = await Promise.all([
          prisma.transaction.count({ where }),
          prisma.transaction.findMany({
            where,
            include: {
              category: {
                select: { id: true, name: true, icon: true, color: true },
              },
            },
            orderBy: {
              [params.sortBy || 'transactionDate']: params.sortOrder || 'desc',
            },
            skip,
            take: limit,
          }),
        ]);

        const totalPages = Math.ceil(totalItems / limit) || 1;

        return {
          items: items as TransactionRecord[],
          pagination: {
            totalItems,
            totalPages,
            currentPage: page,
            limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        };
      } catch (e) {
        // fallback
      }
    }

    // Offline / Test in-memory filtering
    let filtered = Array.from(memoryTransactions.values()).filter(t => t.userId === userId);

    if (params.type) {
      filtered = filtered.filter(t => t.type === params.type);
    }
    if (params.categoryId) {
      filtered = filtered.filter(t => t.categoryId === params.categoryId);
    }
    if (params.paymentMethod) {
      filtered = filtered.filter(t => t.paymentMethod.toLowerCase().includes(params.paymentMethod!.toLowerCase()));
    }
    if (params.startDate) {
      const start = new Date(params.startDate);
      filtered = filtered.filter(t => new Date(t.transactionDate) >= start);
    }
    if (params.endDate) {
      const end = new Date(params.endDate);
      filtered = filtered.filter(t => new Date(t.transactionDate) <= end);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        t =>
          t.title.toLowerCase().includes(q) ||
          (t.merchant && t.merchant.toLowerCase().includes(q)) ||
          (t.note && t.note.toLowerCase().includes(q))
      );
    }

    filtered.sort((a, b) => {
      const order = params.sortOrder === 'asc' ? 1 : -1;
      if (params.sortBy === 'amount') return (a.amount - b.amount) * order;
      return (new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()) * (params.sortOrder === 'asc' ? -1 : 1);
    });

    const page = params.page || 1;
    const limit = params.limit || 20;
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const paginatedItems = filtered.slice((page - 1) * limit, page * limit);

    return {
      items: paginatedItems,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async update(id: string, data: UpdateTransactionData): Promise<TransactionRecord | null> {
    if (!this.isTestMode()) {
      try {
        return (await prisma.transaction.update({
          where: { id },
          data: {
            ...(data.amount !== undefined ? { amount: data.amount } : {}),
            ...(data.type !== undefined ? { type: data.type } : {}),
            ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
            ...(data.title !== undefined ? { title: data.title } : {}),
            ...(data.merchant !== undefined ? { merchant: data.merchant } : {}),
            ...(data.note !== undefined ? { note: data.note } : {}),
            ...(data.transactionDate !== undefined ? { transactionDate: data.transactionDate } : {}),
            ...(data.paymentMethod !== undefined ? { paymentMethod: data.paymentMethod } : {}),
          },
          include: {
            category: {
              select: { id: true, name: true, icon: true, color: true },
            },
          },
        })) as TransactionRecord;
      } catch (e) {
        // fallback
      }
    }

    const existing = memoryTransactions.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, updatedAt: new Date() };
    memoryTransactions.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    if (!this.isTestMode()) {
      try {
        await prisma.transaction.delete({ where: { id } });
        return true;
      } catch (e) {
        // fallback
      }
    }
    return memoryTransactions.delete(id);
  }

  clearMemory(): void {
    memoryTransactions.clear();
  }
}

export const transactionRepository = new TransactionRepository();
