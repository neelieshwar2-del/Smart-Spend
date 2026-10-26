import { prisma } from '../../prisma/client.js';

export interface NotificationRecord {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  readAt: Date | null;
  createdAt: Date;
}

const memoryNotifications = new Map<string, NotificationRecord>();

export class NotificationRepository {
  private isTestMode(): boolean {
    return process.env.NODE_ENV === 'test';
  }

  async create(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
  }): Promise<NotificationRecord> {
    if (!this.isTestMode()) {
      try {
        return await prisma.notification.create({
          data: {
            userId: data.userId,
            type: data.type,
            title: data.title,
            message: data.message,
          },
        });
      } catch {
        // Fallback
      }
    }

    const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const record: NotificationRecord = {
      id,
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      readAt: null,
      createdAt: new Date(),
    };

    memoryNotifications.set(id, record);
    return record;
  }

  async findByUserId(
    userId: string,
    params?: { unreadOnly?: boolean; limit?: number }
  ): Promise<NotificationRecord[]> {
    const limit = params?.limit || 50;

    if (!this.isTestMode()) {
      try {
        const where: any = { userId };
        if (params?.unreadOnly) {
          where.readAt = null;
        }

        return await prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit,
        });
      } catch {
        // Fallback
      }
    }

    return Array.from(memoryNotifications.values())
      .filter(n => {
        if (n.userId !== userId) return false;
        if (params?.unreadOnly && n.readAt !== null) return false;
        return true;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async findById(id: string): Promise<NotificationRecord | null> {
    if (!this.isTestMode()) {
      try {
        return await prisma.notification.findUnique({ where: { id } });
      } catch {
        // Fallback
      }
    }

    return memoryNotifications.get(id) || null;
  }

  async markAsRead(id: string, userId: string): Promise<NotificationRecord | null> {
    if (!this.isTestMode()) {
      try {
        return await prisma.notification.update({
          where: { id, userId },
          data: { readAt: new Date() },
        });
      } catch {
        // Fallback
      }
    }

    const notif = memoryNotifications.get(id);
    if (!notif || notif.userId !== userId) return null;

    const updated = { ...notif, readAt: new Date() };
    memoryNotifications.set(id, updated);
    return updated;
  }

  async markAllAsRead(userId: string): Promise<number> {
    if (!this.isTestMode()) {
      try {
        const result = await prisma.notification.updateMany({
          where: { userId, readAt: null },
          data: { readAt: new Date() },
        });
        return result.count;
      } catch {
        // Fallback
      }
    }

    let count = 0;
    const now = new Date();
    for (const [id, notif] of memoryNotifications.entries()) {
      if (notif.userId === userId && notif.readAt === null) {
        memoryNotifications.set(id, { ...notif, readAt: now });
        count++;
      }
    }
    return count;
  }

  async countUnread(userId: string): Promise<number> {
    if (!this.isTestMode()) {
      try {
        return await prisma.notification.count({
          where: { userId, readAt: null },
        });
      } catch {
        // Fallback
      }
    }

    return Array.from(memoryNotifications.values()).filter(
      n => n.userId === userId && n.readAt === null
    ).length;
  }

  clearMemory(): void {
    memoryNotifications.clear();
  }
}

export const notificationRepository = new NotificationRepository();
