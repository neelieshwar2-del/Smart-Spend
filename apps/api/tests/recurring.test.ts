import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { authRepository } from '../src/modules/auth/auth.repository.js';
import { categoryRepository } from '../src/modules/categories/category.repository.js';
import { transactionRepository } from '../src/modules/transactions/transaction.repository.js';
import { recurringRepository } from '../src/modules/recurring/recurring.repository.js';

describe('Recurring Payments and Subscriptions API', () => {
  let tokenUserA: string;
  let tokenUserB: string;
  let categoryId: string;

  beforeEach(async () => {
    authRepository.clearMemory();
    categoryRepository.clearMemory();
    transactionRepository.clearMemory();
    recurringRepository.clearMemory();

    // Register User A
    const regA = await request(app).post('/api/v1/auth/register').send({
      name: 'Aarav Patel',
      email: 'aarav.patel@fintech.io',
      password: 'Password123',
    });
    tokenUserA = regA.body.data.tokens.accessToken;

    // Register User B
    const regB = await request(app).post('/api/v1/auth/register').send({
      name: 'Diya Sen',
      email: 'diya.sen@fintech.io',
      password: 'Password123',
    });
    tokenUserB = regB.body.data.tokens.accessToken;

    // Fetch initial categories
    const catRes = await request(app)
      .get('/api/v1/categories')
      .set('Authorization', `Bearer ${tokenUserA}`);
    categoryId = catRes.body.data[0].id;
  });

  describe('Recurring Rules CRUD Operations', () => {
    it('POST /api/v1/recurring should create a new recurring subscription', async () => {
      const res = await request(app)
        .post('/api/v1/recurring')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          title: 'Netflix 4K UHD',
          amount: 649, // ₹649.00 -> 64900 paise
          categoryId,
          frequency: 'monthly',
          paymentMethod: 'UPI Autopay',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Netflix 4K UHD');
      expect(res.body.data.amount).toBe(64900);
      expect(res.body.data.amountRupees).toBe(649);
      expect(res.body.data.frequency).toBe('monthly');
      expect(res.body.data.isActive).toBe(true);
      expect(res.body.data.category).toBeDefined();
    });

    it('GET /api/v1/recurring should list all recurring rules for user', async () => {
      await request(app)
        .post('/api/v1/recurring')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          title: 'Spotify Premium',
          amount: 119,
          categoryId,
          frequency: 'monthly',
        });

      await request(app)
        .post('/api/v1/recurring')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          title: 'Gym Membership',
          amount: 1500,
          categoryId,
          frequency: 'monthly',
        });

      const res = await request(app)
        .get('/api/v1/recurring')
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data[0].amountRupees).toBe(119);
      expect(res.body.data[1].amountRupees).toBe(1500);
    });

    it('GET /api/v1/recurring/:id should fetch single rule by ID', async () => {
      const createRes = await request(app)
        .post('/api/v1/recurring')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          title: 'Apple One',
          amount: 365,
          categoryId,
          frequency: 'monthly',
        });

      const ruleId = createRes.body.data.id;

      const res = await request(app)
        .get(`/api/v1/recurring/${ruleId}`)
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(ruleId);
      expect(res.body.data.title).toBe('Apple One');
    });

    it('PATCH /api/v1/recurring/:id should update rule amount and active status', async () => {
      const createRes = await request(app)
        .post('/api/v1/recurring')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          title: 'YouTube Premium',
          amount: 129,
          categoryId,
          frequency: 'monthly',
        });

      const ruleId = createRes.body.data.id;

      const patchRes = await request(app)
        .patch(`/api/v1/recurring/${ruleId}`)
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          amount: 149, // increased price
          isActive: false,
        });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.data.amount).toBe(14900);
      expect(patchRes.body.data.amountRupees).toBe(149);
      expect(patchRes.body.data.isActive).toBe(false);
    });

    it('DELETE /api/v1/recurring/:id should delete recurring rule', async () => {
      const createRes = await request(app)
        .post('/api/v1/recurring')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          title: 'Old Subscription',
          amount: 299,
          categoryId,
          frequency: 'monthly',
        });

      const ruleId = createRes.body.data.id;

      const delRes = await request(app)
        .delete(`/api/v1/recurring/${ruleId}`)
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(delRes.status).toBe(200);

      const getRes = await request(app)
        .get(`/api/v1/recurring/${ruleId}`)
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(getRes.status).toBe(404);
    });
  });

  describe('Cross-User Protection', () => {
    it('User B cannot access or update User A recurring rules', async () => {
      const createRes = await request(app)
        .post('/api/v1/recurring')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          title: 'Private User A Subscription',
          amount: 999,
          categoryId,
          frequency: 'monthly',
        });

      const ruleId = createRes.body.data.id;

      // User B tries to read
      const readRes = await request(app)
        .get(`/api/v1/recurring/${ruleId}`)
        .set('Authorization', `Bearer ${tokenUserB}`);
      expect(readRes.status).toBe(403);

      // User B tries to update
      const updateRes = await request(app)
        .patch(`/api/v1/recurring/${ruleId}`)
        .set('Authorization', `Bearer ${tokenUserB}`)
        .send({ amount: 1 });
      expect(updateRes.status).toBe(403);

      // User B tries to delete
      const delRes = await request(app)
        .delete(`/api/v1/recurring/${ruleId}`)
        .set('Authorization', `Bearer ${tokenUserB}`);
      expect(delRes.status).toBe(403);
    });
  });

  describe('Idempotent Recurring Runner Execution', () => {
    it('POST /api/v1/recurring/process should execute due rules idempotently without duplicate transactions', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1); // yesterday (due now)

      // Create a rule that is due
      const createRes = await request(app)
        .post('/api/v1/recurring')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          title: 'Broadband Fiber Internet',
          amount: 799,
          categoryId,
          frequency: 'monthly',
          startDate: pastDate.toISOString(),
          nextDueDate: pastDate.toISOString(),
          autoRecord: true,
        });

      const ruleId = createRes.body.data.id;
      expect(createRes.status).toBe(201);

      // 1. Run the processor for the first time
      const run1 = await request(app)
        .post('/api/v1/recurring/process')
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(run1.status).toBe(200);
      expect(run1.body.data.processedCount).toBe(1);
      expect(run1.body.data.createdTransactions).toBe(1);
      expect(run1.body.data.details[0].skippedDuplicate).toBe(false);

      // Verify transaction was logged
      const txns1 = await request(app)
        .get('/api/v1/transactions')
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(txns1.body.data.items.length).toBe(1);
      expect(txns1.body.data.items[0].title).toBe('Broadband Fiber Internet');
      expect(txns1.body.data.items[0].amount).toBe(79900);
      expect(txns1.body.data.items[0].isRecurring).toBe(true);
      expect(txns1.body.data.items[0].recurringRuleId).toBe(ruleId);

      // Verify nextDueDate was advanced by 1 month
      const updatedRule = await request(app)
        .get(`/api/v1/recurring/${ruleId}`)
        .set('Authorization', `Bearer ${tokenUserA}`);

      const nextDue = new Date(updatedRule.body.data.nextDueDate);
      expect(nextDue.getTime()).toBeGreaterThan(Date.now());

      // 2. Run the processor a second time immediately
      const run2 = await request(app)
        .post('/api/v1/recurring/process')
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(run2.status).toBe(200);
      // Since nextDueDate is now in the future, 0 rules should be due
      expect(run2.body.data.processedCount).toBe(0);
      expect(run2.body.data.createdTransactions).toBe(0);

      // Transactions count must still be strictly 1 (no duplicate charge!)
      const txns2 = await request(app)
        .get('/api/v1/transactions')
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(txns2.body.data.items.length).toBe(1);
    });
  });
});
