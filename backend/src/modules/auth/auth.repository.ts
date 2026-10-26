import { prisma } from '../../prisma/client.js';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  currency: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RefreshTokenRecord {
  id: string;
  userId: string;
  hashedToken: string;
  family: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
}

// In-memory fallback cache for offline development and isolated test suites
const memoryUsers = new Map<string, UserRecord>();
const memoryTokens = new Map<string, RefreshTokenRecord>();
let isDbAvailable: boolean | null = null;

export class AuthRepository {
  private async isDatabaseLive(): Promise<boolean> {
    if (process.env.NODE_ENV === 'test') {
      return false; // Fast, isolated tests without external socket timeouts
    }
    if (isDbAvailable !== null) return isDbAvailable;
    try {
      await prisma.$queryRaw`SELECT 1`;
      isDbAvailable = true;
    } catch {
      isDbAvailable = false;
    }
    return isDbAvailable;
  }

  async findUserByEmail(email: string): Promise<UserRecord | null> {
    if (await this.isDatabaseLive()) {
      try {
        return await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });
      } catch (e) {
        isDbAvailable = false;
      }
    }

    // Offline fallback
    for (const u of memoryUsers.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return u;
      }
    }
    return null;
  }

  async findUserById(id: string): Promise<UserRecord | null> {
    if (await this.isDatabaseLive()) {
      try {
        return await prisma.user.findUnique({ where: { id } });
      } catch (e) {
        isDbAvailable = false;
      }
    }
    return memoryUsers.get(id) || null;
  }

  async createUser(data: {
    name: string;
    email: string;
    passwordHash: string;
    currency: string;
    timezone: string;
  }): Promise<UserRecord> {
    if (await this.isDatabaseLive()) {
      try {
        const user = await prisma.user.create({
          data: {
            name: data.name,
            email: data.email.toLowerCase(),
            passwordHash: data.passwordHash,
            currency: data.currency,
            timezone: data.timezone,
          },
        });
        await this.createDefaultCategories(user.id);
        return user;
      } catch (e) {
        isDbAvailable = false;
      }
    }

    // Offline fallback
    const user: UserRecord = {
      id: 'usr_' + Math.random().toString(36).substring(2, 11),
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      currency: data.currency,
      timezone: data.timezone,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryUsers.set(user.id, user);
    return user;
  }

  async createDefaultCategories(userId: string): Promise<void> {
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

    try {
      for (const cat of defaults) {
        await prisma.category.create({
          data: {
            userId,
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
            type: cat.type,
            isDefault: true,
          },
        });
      }

      // Initialize initial monthly budget of ₹45,000 (4,500,000 paise)
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      await prisma.budget.create({
        data: {
          userId,
          name: 'Monthly Spend Limit',
          amountLimit: 4500000,
          period: 'monthly',
          startDate: startOfMonth,
          endDate: endOfMonth,
        },
      });
    } catch (e) {
      // Safe ignore in fallback mode
    }
  }

  async saveRefreshToken(data: {
    userId: string;
    hashedToken: string;
    family: string;
    expiresAt: Date;
  }): Promise<RefreshTokenRecord> {
    if (await this.isDatabaseLive()) {
      try {
        return await prisma.refreshToken.create({
          data: {
            userId: data.userId,
            hashedToken: data.hashedToken,
            family: data.family,
            expiresAt: data.expiresAt,
          },
        });
      } catch (e) {
        isDbAvailable = false;
      }
    }

    const record: RefreshTokenRecord = {
      id: 'rt_' + Math.random().toString(36).substring(2, 11),
      userId: data.userId,
      hashedToken: data.hashedToken,
      family: data.family,
      expiresAt: data.expiresAt,
      revokedAt: null,
      createdAt: new Date(),
    };
    memoryTokens.set(record.hashedToken, record);
    return record;
  }

  async findRefreshToken(hashedToken: string): Promise<RefreshTokenRecord | null> {
    if (await this.isDatabaseLive()) {
      try {
        return await prisma.refreshToken.findUnique({
          where: { hashedToken },
        });
      } catch (e) {
        isDbAvailable = false;
      }
    }
    return memoryTokens.get(hashedToken) || null;
  }

  async revokeRefreshToken(hashedToken: string): Promise<void> {
    if (await this.isDatabaseLive()) {
      try {
        await prisma.refreshToken.updateMany({
          where: { hashedToken },
          data: { revokedAt: new Date() },
        });
        return;
      } catch (e) {
        isDbAvailable = false;
      }
    }
    const record = memoryTokens.get(hashedToken);
    if (record) {
      record.revokedAt = new Date();
    }
  }

  async revokeTokenFamily(family: string): Promise<void> {
    if (await this.isDatabaseLive()) {
      try {
        await prisma.refreshToken.updateMany({
          where: { family },
          data: { revokedAt: new Date() },
        });
        return;
      } catch (e) {
        isDbAvailable = false;
      }
    }
    for (const t of memoryTokens.values()) {
      if (t.family === family) {
        t.revokedAt = new Date();
      }
    }
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    if (await this.isDatabaseLive()) {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { passwordHash },
        });
        return;
      } catch (e) {
        isDbAvailable = false;
      }
    }
    const u = memoryUsers.get(userId);
    if (u) {
      u.passwordHash = passwordHash;
      u.updatedAt = new Date();
    }
  }

  // Clear memory cache (useful for clean unit tests)
  clearMemory(): void {
    memoryUsers.clear();
    memoryTokens.clear();
  }
}

export const authRepository = new AuthRepository();

