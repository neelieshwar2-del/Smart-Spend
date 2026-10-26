import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { authRepository } from '../src/modules/auth/auth.repository.js';
import { categoryRepository } from '../src/modules/categories/category.repository.js';
import { transactionRepository } from '../src/modules/transactions/transaction.repository.js';
import { budgetRepository } from '../src/modules/budgets/budget.repository.js';
import { recurringRepository } from '../src/modules/recurring/recurring.repository.js';
import { aiRepository } from '../src/modules/ai/ai.repository.js';

describe('AI Financial Assistant and Insights API', () => {
  let tokenUser: string;
  let foodCatId: string;

  beforeEach(async () => {
    authRepository.clearMemory();
    categoryRepository.clearMemory();
    transactionRepository.clearMemory();
    budgetRepository.clearMemory();
    recurringRepository.clearMemory();
    aiRepository.clearMemory();

    const reg = await request(app).post('/api/v1/auth/register').send({
      name: 'Rohan Sharma',
      email: 'rohan.sharma@fintech.io',
      password: 'Password123',
    });
    tokenUser = reg.body.data.tokens.accessToken;

    const catRes = await request(app)
      .get('/api/v1/categories')
      .set('Authorization', `Bearer ${tokenUser}`);
    foodCatId = catRes.body.data[0].id;

    // Create a budget
    await request(app)
      .post('/api/v1/budgets')
      .set('Authorization', `Bearer ${tokenUser}`)
      .send({
        name: 'October Spending Limit',
        amountLimit: 45000,
        period: 'monthly',
      });

    // Create a transaction
    await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${tokenUser}`)
      .send({
        type: 'expense',
        amount: 1500,
        categoryId: foodCatId,
        title: 'Dinner at Smoke House Deli',
      });
  });

  it('POST /api/v1/ai/insights should generate actionable insights based on live DB data', async () => {
    const res = await request(app)
      .post('/api/v1/ai/insights')
      .set('Authorization', `Bearer ${tokenUser}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);

    const first = res.body.data[0];
    expect(first.title).toBeDefined();
    expect(first.content).toBeDefined();
    expect(first.impactScore).toBeGreaterThan(0);
  });

  it('POST /api/v1/ai/chat should answer financial questions grounded in user database metrics', async () => {
    const res = await request(app)
      .post('/api/v1/ai/chat')
      .set('Authorization', `Bearer ${tokenUser}`)
      .send({
        message: 'Can I afford dinner tonight?',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.answer).toContain('dinner');
    expect(res.body.data.metrics).toBeDefined();
  });

  it('GET /api/v1/ai/insights/history should return insight history', async () => {
    // Generate first
    await request(app)
      .post('/api/v1/ai/insights')
      .set('Authorization', `Bearer ${tokenUser}`);

    const res = await request(app)
      .get('/api/v1/ai/insights/history')
      .set('Authorization', `Bearer ${tokenUser}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});
