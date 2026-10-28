import { notificationRepository, NotificationRecord } from './notification.repository.js';
import { CreateNotificationInput, NotificationQueryParams } from './notification.schema.js';
import { AppError } from '../../middlewares/errorHandler.js';

export interface FormattedNotification extends NotificationRecord {
  timeAgo: string;
  isRead: boolean;
}

export class NotificationService {
  private formatNotification(n: NotificationRecord): FormattedNotification {
    const diffMs = Date.now() - new Date(n.createdAt).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    let timeAgo = 'Just now';
    if (diffDays > 0) timeAgo = `${diffDays}d ago`;
    else if (diffHours > 0) timeAgo = `${diffHours}h ago`;
    else if (diffMins > 0) timeAgo = `${diffMins}m ago`;

    return {
      ...n,
      timeAgo,
      isRead: n.readAt !== null,
    };
  }

  async create(userId: string, input: CreateNotificationInput): Promise<FormattedNotification> {
    const notif = await notificationRepository.create({
      userId,
      type: input.type,
      title: input.title,
      message: input.message,
    });
    return this.formatNotification(notif);
  }

  async list(userId: string, query?: NotificationQueryParams): Promise<FormattedNotification[]> {
    const list = await notificationRepository.findByUserId(userId, query);
    return list.map(n => this.formatNotification(n));
  }

  async markAsRead(userId: string, id: string): Promise<FormattedNotification> {
    const existing = await notificationRepository.findById(id);
    if (!existing) {
      throw new AppError('Notification not found', 404, 'NOT_FOUND');
    }
    if (existing.userId !== userId) {
      throw new AppError('You do not have permission to modify this notification', 403, 'FORBIDDEN');
    }

    const updated = await notificationRepository.markAsRead(id, userId);
    if (!updated) {
      throw new AppError('Failed to mark notification as read', 500, 'UPDATE_FAILED');
    }
    return this.formatNotification(updated);
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const count = await notificationRepository.markAllAsRead(userId);
    return { count };
  }

  async getUnreadCount(userId: string): Promise<{ unreadCount: number }> {
    const unreadCount = await notificationRepository.countUnread(userId);
    return { unreadCount };
  }
}

export const notificationService = new NotificationService();
