import { prisma, isDatabaseLive, markDatabaseOffline } from '../../prisma/client.js';

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

const DEFAULT_SLUG_MAP: Record<string, { name: string; icon: string; color: string; type: string }> = {
  cat_food: { name: 'Food & Dining', icon: 'utensils', color: '#F59E0B', type: 'expense' },
  cat_groceries: { name: 'Groceries', icon: 'shopping-cart', color: '#10B981', type: 'expense' },
  cat_transport: { name: 'Transport', icon: 'car', color: '#3B82F6', type: 'expense' },
  cat_shopping: { name: 'Shopping', icon: 'shopping-bag', color: '#EC4899', type: 'expense' },
  cat_bills: { name: 'Bills & Utilities', icon: 'zap', color: '#8B5CF6', type: 'expense' },
  cat_entertainment: { name: 'Entertainment', icon: 'film', color: '#F43F5E', type: 'expense' },
  cat_health: { name: 'Health & Fitness', icon: 'heart', color: '#06B6D4', type: 'expense' },
  cat_education: { name: 'Education', icon: 'book', color: '#6366F1', type: 'expense' },
  cat_salary: { name: 'Salary', icon: 'briefcase', color: '#22C55E', type: 'income' },
  cat_freelance: { name: 'Freelance', icon: 'laptop', color: '#14B8A6', type: 'income' },
  cat_investments: { name: 'Investments', icon: 'trending-up', color: '#84CC16', type: 'income' },
};

export class CategoryRepository {
  private isTestMode(): boolean {
    return process.env.NODE_ENV === 'test';
  }

  async listCategories(userId: string): Promise<CategoryRecord[]> {
    if (isDatabaseLive()) {
      try {
        return await prisma.category.findMany({
          where: {
            OR: [{ userId }, { userId: null }, { isDefault: true }],
          },
          orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
        });
      } catch (e) {
        markDatabaseOffline(e);
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
    if (isDatabaseLive()) {
      try {
        const found = await prisma.category.findUnique({
          where: { id },
        });
        if (found) return found;
      } catch (e) {
        markDatabaseOffline(e);
      }
    }

    const mem = memoryCategories.get(id);
    if (mem) return mem;

    // Resolve default mobile category slugs (e.g. cat_food, cat_groceries) outside test mode
    const mapped = !this.isTestMode() ? DEFAULT_SLUG_MAP[id] : undefined;
    if (mapped) {
      if (isDatabaseLive()) {
        try {
          const byName = await prisma.category.findFirst({
            where: { name: mapped.name, type: mapped.type },
          });
          if (byName) return byName;

          return await prisma.category.create({
            data: {
              id,
              userId: null,
              name: mapped.name,
              icon: mapped.icon,
              color: mapped.color,
              type: mapped.type,
              isDefault: true,
            },
          });
        } catch (e) {
          markDatabaseOffline(e);
        }
      }
      const fallbackCat: CategoryRecord = {
        id,
        userId: null,
        name: mapped.name,
        icon: mapped.icon,
        color: mapped.color,
        type: mapped.type,
        isDefault: true,
        createdAt: new Date(),
      };
      memoryCategories.set(id, fallbackCat);
      return fallbackCat;
    }

    return null;
  }

  async findByNameAndType(userId: string, name: string, type: string): Promise<CategoryRecord | null> {
    if (isDatabaseLive()) {
      try {
        return await prisma.category.findFirst({
          where: {
            userId,
            name: { equals: name, mode: 'insensitive' },
            type,
          },
        });
      } catch (e) {
        markDatabaseOffline(e);
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
    if (isDatabaseLive()) {
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
        markDatabaseOffline(e);
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
    if (isDatabaseLive()) {
      try {
        return await prisma.category.update({
          where: { id },
          data,
        });
      } catch (e) {
        markDatabaseOffline(e);
      }
    }

    const existing = memoryCategories.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data };
    memoryCategories.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    if (isDatabaseLive()) {
      try {
        await prisma.category.delete({ where: { id } });
        return true;
      } catch (e) {
        markDatabaseOffline(e);
      }
    }
    return memoryCategories.delete(id);
  }

  async countLinkedTransactions(categoryId: string): Promise<number> {
    if (isDatabaseLive()) {
      try {
        return await prisma.transaction.count({
          where: { categoryId },
        });
      } catch (e) {
        markDatabaseOffline(e);
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
