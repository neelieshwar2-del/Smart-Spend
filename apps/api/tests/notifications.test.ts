import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { authRepository } from '../src/modules/auth/auth.repository.js';
import { notificationRepository } from '../src/modules/notifications/notification.repository.js';

describe('Notifications API', () => {
  let tokenUserA: string;
  let tokenUserB: string;

  beforeEach(async () => {
    authRepository.clearMemory();
    notificationRepository.clearMemory();

    const regA = await request(app).post('/api/v1/auth/register').send({
      name: 'Rohan Sharma',
      email: 'rohan.sharma@fintech.io',
      password: 'Password123',
    });
    tokenUserA = regA.body.data.tokens.accessToken;

    const regB = await request(app).post('/api/v1/auth/register').send({
      name: 'Pooja Verma',
      email: 'pooja.verma@fintech.io',
      password: 'Password123',
    });
    tokenUserB = regB.body.data.tokens.accessToken;

    // Seed 2 notifications for User A
    await notificationRepository.create({
      userId: regA.body.data.user.id,
      type: 'BUDGET_WARNING',
      title: 'Monthly Spend Alert',
      message: 'You have consumed 80% of your October spend target.',
    });

    await notificationRepository.create({
      userId: regA.body.data.user.id,
      type: 'RECURRING_DUE',
      title: 'Upcoming Subscription',
      message: 'Netflix Premium (₹649.00) auto-debit scheduled for tomorrow.',
    });
  });

  it('GET /api/v1/notifications should return user notifications', async () => {
    const res = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${tokenUserA}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data[0].isRead).toBe(false);
  });

  it('GET /api/v1/notifications/unread-count should return unread count', async () => {
    const res = await request(app)
      .get('/api/v1/notifications/unread-count')
      .set('Authorization', `Bearer ${tokenUserA}`);

    expect(res.status).toBe(200);
    expect(res.body.data.unreadCount).toBe(2);
  });

  it('PATCH /api/v1/notifications/:id/read should mark single notification as read', async () => {
    const listRes = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${tokenUserA}`);

    const id = listRes.body.data[0].id;

    const patchRes = await request(app)
      .patch(`/api/v1/notifications/${id}/read`)
      .set('Authorization', `Bearer ${tokenUserA}`);

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.isRead).toBe(true);

    const countRes = await request(app)
      .get('/api/v1/notifications/unread-count')
      .set('Authorization', `Bearer ${tokenUserA}`);

    expect(countRes.body.data.unreadCount).toBe(1);
  });

  it('POST /api/v1/notifications/read-all should mark all as read', async () => {
    const postRes = await request(app)
      .post('/api/v1/notifications/read-all')
      .set('Authorization', `Bearer ${tokenUserA}`);

    expect(postRes.status).toBe(200);
    expect(postRes.body.data.count).toBe(2);

    const countRes = await request(app)
      .get('/api/v1/notifications/unread-count')
      .set('Authorization', `Bearer ${tokenUserA}`);

    expect(countRes.body.data.unreadCount).toBe(0);
  });

  it('User B cannot read User A notifications', async () => {
    const listRes = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${tokenUserA}`);

    const id = listRes.body.data[0].id;

    const patchRes = await request(app)
      .patch(`/api/v1/notifications/${id}/read`)
      .set('Authorization', `Bearer ${tokenUserB}`);

    expect(patchRes.status).toBe(403);
  });
});
