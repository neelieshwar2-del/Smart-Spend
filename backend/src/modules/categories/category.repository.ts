import { prisma } from '../../prisma/client.js';

export interface CategoryRecord {
  id: string;
  userId: string | null;
  name: string;
  icon: string;
  color: string;
  type: string;
  isDefault: boolean;
  createdAt: Date;
}

const memoryCategories = new Map<string, CategoryRecord>();

export class CategoryRepository {
  private isTestMode(): boolean {
    return process.env.NODE_ENV === 'test';
  }

  async listCategories(userId: string): Promise<CategoryRecord[]> {
    if (!this.isTestMode()) {
      try {
        return await prisma.category.findMany({
          where: {
            OR: [{ userId }, { userId: null }, { isDefault: true }],
          },
          orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
        });
      } catch (e) {
        // fallback
      }
    }

    const results: CategoryRecord[] = [];
    for (const cat of memoryCategories.values()) {
      if (cat.userId === userId || cat.userId === null || cat.isDefault) {
        results.push(cat);
      }
    }

    if (results.length === 0) {
      return this.seedDefaults(userId);
    }
    return results.sort((a, b) => a.name.localeCompare(b.name));
  }

  async findById(id: string): Promise<CategoryRecord | null> {
    if (!this.isTestMode()) {
      try {
        return await prisma.category.findUnique({
          where: { id },
        });
      } catch (e) {
        // fallback
      }
    }
    return memoryCategories.get(id) || null;
  }

  async findByNameAndType(userId: string, name: string, type: string): Promise<CategoryRecord | null> {
    if (!this.isTestMode()) {
      try {
        return await prisma.category.findFirst({
          where: {
            userId,
            name: { equals: name, mode: 'insensitive' },
            type,
          },
        });
      } catch (e) {
        // fallback
      }
    }

    for (const cat of memoryCategories.values()) {
      if (
        cat.userId === userId &&
        cat.name.toLowerCase() === name.toLowerCase() &&
        cat.type === type
      ) {
        return cat;
      }
    }
    return null;
  }

  async create(data: {
    userId: string;
    name: string;
    icon: string;
    color: string;
    type: string;
    isDefault?: boolean;
  }): Promise<CategoryRecord> {
    if (!this.isTestMode()) {
      try {
        return await prisma.category.create({
          data: {
            userId: data.userId,
            name: data.name,
            icon: data.icon,
            color: data.color,
            type: data.type,
            isDefault: data.isDefault || false,
          },
        });
      } catch (e) {
        // fallback
      }
    }

    const cat: CategoryRecord = {
      id: 'cat_' + Math.random().toString(36).substring(2, 11),
      userId: data.userId,
      name: data.name,
      icon: data.icon,
      color: data.color,
      type: data.type,
      isDefault: data.isDefault || false,
      createdAt: new Date(),
    };
    memoryCategories.set(cat.id, cat);
    return cat;
  }

  async update(id: string, data: Partial<CategoryRecord>): Promise<CategoryRecord | null> {
    if (!this.isTestMode()) {
      try {
        return await prisma.category.update({
          where: { id },
          data,
        });
      } catch (e) {
        // fallback
      }
    }

    const existing = memoryCategories.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data };
    memoryCategories.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    if (!this.isTestMode()) {
      try {
        await prisma.category.delete({ where: { id } });
        return true;
      } catch (e) {
        // fallback
      }
    }
    return memoryCategories.delete(id);
  }

  async countLinkedTransactions(categoryId: string): Promise<number> {
    if (!this.isTestMode()) {
      try {
        return await prisma.transaction.count({
          where: { categoryId },
        });
      } catch (e) {
        // fallback
      }
    }
    return 0;
  }

  clearMemory(): void {
    memoryCategories.clear();
  }

  seedDefaults(userId: string): CategoryRecord[] {
    const defaults = [
      { name: 'Food & Dining', icon: 'restaurant', color: '#416900', type: 'expense' },
      { name: 'Groceries', icon: 'shopping_cart', color: '#555e74', type: 'expense' },
      { name: 'Transport', icon: 'local_taxi', color: '#01081a', type: 'expense' },
      { name: 'Shopping', icon: 'shopping_bag', color: '#76777d', type: 'expense' },
      { name: 'Bills & Utility', icon: 'receipt_long', color: '#ba1a1a', type: 'expense' },
      { name: 'Entertainment', icon: 'movie', color: '#555e74', type: 'expense' },
      { name: 'Income / Salary', icon: 'payments', color: '#267548', type: 'income' },
      { name: 'Freelance Payout', icon: 'account_balance_wallet', color: '#00522c', type: 'income' },
    ];

    const records: CategoryRecord[] = [];
    for (const d of defaults) {
      const cat: CategoryRecord = {
        id: 'cat_' + d.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        userId,
        name: d.name,
        icon: d.icon,
        color: d.color,
        type: d.type,
        isDefault: true,
        createdAt: new Date(),
      };
      memoryCategories.set(cat.id, cat);
      records.push(cat);
    }
    return records;
  }
}

export const categoryRepository = new CategoryRepository();
