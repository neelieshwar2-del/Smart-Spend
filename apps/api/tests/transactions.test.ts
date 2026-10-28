import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { authRepository } from '../src/modules/auth/auth.repository.js';
import { categoryRepository } from '../src/modules/categories/category.repository.js';
import { transactionRepository } from '../src/modules/transactions/transaction.repository.js';

describe('Categories and Transactions API', () => {
  let tokenUserA: string;
  let tokenUserB: string;
  let categoryId: string;

  beforeEach(async () => {
    authRepository.clearMemory();
    categoryRepository.clearMemory();
    transactionRepository.clearMemory();

    // Register User A
    const regA = await request(app).post('/api/v1/auth/register').send({
      name: 'Rohan Sharma',
      email: 'rohan.sharma@fintech.io',
      password: 'Password123',
    });
    tokenUserA = regA.body.data.tokens.accessToken;

    // Register User B
    const regB = await request(app).post('/api/v1/auth/register').send({
      name: 'Aarav Patel',
      email: 'aarav.patel@fintech.io',
      password: 'Password123',
    });
    tokenUserB = regB.body.data.tokens.accessToken;

    // Fetch initial categories for User A
    const catRes = await request(app)
      .get('/api/v1/categories')
      .set('Authorization', `Bearer ${tokenUserA}`);
    categoryId = catRes.body.data[0].id;
  });

  describe('Categories Management', () => {
    it('GET /api/v1/categories should return seeded default categories', async () => {
      const res = await request(app)
        .get('/api/v1/categories')
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data.some((c: any) => c.name === 'Food & Dining')).toBe(true);
    });

    it('POST /api/v1/categories should create a custom category', async () => {
      const res = await request(app)
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          name: 'Gym & Fitness',
          icon: 'fitness_center',
          color: '#b6f16a',
          type: 'expense',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Gym & Fitness');
      expect(res.body.data.isDefault).toBe(false);
    });

    it('DELETE /api/v1/categories/:id should prevent deleting system default categories', async () => {
      // Try to delete a default category
      const res = await request(app)
        .delete(`/api/v1/categories/${categoryId}`)
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CANNOT_DELETE_DEFAULT_CATEGORY');
    });

    it('DELETE /api/v1/categories/:id should allow deleting custom user category', async () => {
      // Create custom category first
      const createRes = await request(app)
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          name: 'Freelance Design',
          icon: 'palette',
          color: '#555e74',
          type: 'income',
        });
      const customCatId = createRes.body.data.id;

      // Delete custom category
      const deleteRes = await request(app)
        .delete(`/api/v1/categories/${customCatId}`)
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);
    });
  });

  describe('Transactions CRUD and Money Handling', () => {
    it('POST /api/v1/transactions should record an expense in integer paise', async () => {
      const res = await request(app)
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          amount: 450, // 450 INR -> 45000 paise
          type: 'expense',
          categoryId,
          title: 'Blue Tokai Coffee Roasters',
          merchant: 'Blue Tokai Coffee Roasters',
          note: 'Afternoon coffee with client',
          paymentMethod: 'UPI (GPay / HDFC)',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.amount).toBe(45000); // 45000 paise
      expect(res.body.data.amountRupees).toBe(450);
      expect(res.body.data.amountFormatted).toBe('₹450.00');
      expect(res.body.data.merchant).toBe('Blue Tokai Coffee Roasters');
    });

    it('POST /api/v1/transactions should reject invalid zero or negative amounts', async () => {
      const res = await request(app)
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          amount: -50,
          type: 'expense',
          categoryId,
          title: 'Invalid Negative',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('GET /api/v1/transactions should return paginated list and support search', async () => {
      // Create 2 transactions
      await request(app)
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          amount: 350,
          type: 'expense',
          categoryId,
          title: 'Starbucks Coffee',
          merchant: 'Starbucks Coffee',
        });

      await request(app)
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          amount: 490,
          type: 'expense',
          categoryId,
          title: 'Blinkit Groceries',
          merchant: 'Blinkit Groceries',
        });

      // Query with search term "Starbucks"
      const res = await request(app)
        .get('/api/v1/transactions?search=Starbucks')
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBe(1);
      expect(res.body.data.items[0].title).toBe('Starbucks Coffee');
      expect(res.body.data.pagination.totalItems).toBe(1);
    });

    it('PATCH /api/v1/transactions/:id should update an existing transaction', async () => {
      const createRes = await request(app)
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          amount: 200,
          type: 'expense',
          categoryId,
          title: 'Metro Recharge',
        });

      const txnId = createRes.body.data.id;

      const updateRes = await request(app)
        .patch(`/api/v1/transactions/${txnId}`)
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          amount: 250,
          note: 'Updated note',
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.success).toBe(true);
      expect(updateRes.body.data.amount).toBe(25000);
      expect(updateRes.body.data.note).toBe('Updated note');
    });

    it('DELETE /api/v1/transactions/:id should delete transaction successfully', async () => {
      const createRes = await request(app)
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          amount: 640,
          type: 'expense',
          categoryId,
          title: 'Swiggy Dinner',
        });

      const txnId = createRes.body.data.id;

      const deleteRes = await request(app)
        .delete(`/api/v1/transactions/${txnId}`)
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);
      expect(deleteRes.body.data.deleted).toBe(true);

      // Verify it no longer exists
      const getRes = await request(app)
        .get(`/api/v1/transactions/${txnId}`)
        .set('Authorization', `Bearer ${tokenUserA}`);
      expect(getRes.status).toBe(404);
    });
  });

  describe('Cross-User Authorization Protection', () => {
    it('User B cannot access or modify User A transactions', async () => {
      // User A creates transaction
      const createRes = await request(app)
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          amount: 12000,
          type: 'income',
          categoryId,
          title: 'Client Retainer Payout',
        });

      const userATxnId = createRes.body.data.id;

      // User B attempts to GET User A's transaction
      const getRes = await request(app)
        .get(`/api/v1/transactions/${userATxnId}`)
        .set('Authorization', `Bearer ${tokenUserB}`);

      expect(getRes.status).toBe(403);
      expect(getRes.body.success).toBe(false);
      expect(getRes.body.error.code).toBe('FORBIDDEN');

      // User B attempts to DELETE User A's transaction
      const delRes = await request(app)
        .delete(`/api/v1/transactions/${userATxnId}`)
        .set('Authorization', `Bearer ${tokenUserB}`);

      expect(delRes.status).toBe(403);
      expect(delRes.body.success).toBe(false);
      expect(delRes.body.error.code).toBe('FORBIDDEN');
    });
  });
});
