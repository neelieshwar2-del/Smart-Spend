import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { authRepository } from '../src/modules/auth/auth.repository.js';
import { categoryRepository } from '../src/modules/categories/category.repository.js';
import { transactionRepository } from '../src/modules/transactions/transaction.repository.js';
import { budgetRepository } from '../src/modules/budgets/budget.repository.js';

describe('Budgets and Dashboard Analytics API', () => {
  let tokenUserA: string;
  let tokenUserB: string;
  let categoryId: string;

  beforeEach(async () => {
    authRepository.clearMemory();
    categoryRepository.clearMemory();
    transactionRepository.clearMemory();
    budgetRepository.clearMemory();

    // Register User A
    const regA = await request(app).post('/api/v1/auth/register').send({
      name: 'Rohan Sharma',
      email: 'rohan.sharma@fintech.io',
      password: 'Password123',
    });
    tokenUserA = regA.body.data.tokens.accessToken;

    // Register User B
    const regB = await request(app).post('/api/v1/auth/register').send({
      name: 'Pooja Verma',
      email: 'pooja.verma@fintech.io',
      password: 'Password123',
    });
    tokenUserB = regB.body.data.tokens.accessToken;

    // Fetch initial categories for User A
    const catRes = await request(app)
      .get('/api/v1/categories')
      .set('Authorization', `Bearer ${tokenUserA}`);
    categoryId = catRes.body.data[0].id;
  });

  describe('Budget CRUD Operations', () => {
    it('POST /api/v1/budgets should create a new monthly budget', async () => {
      const res = await request(app)
        .post('/api/v1/budgets')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          name: 'October Spend Limit',
          amountLimit: 45000, // 45,000 INR -> 4,500,000 paise
          period: 'monthly',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('October Spend Limit');
      expect(res.body.data.amountLimit).toBe(4500000);
      expect(res.body.data.amountLimitRupees).toBe(45000);
      expect(res.body.data.amountLimitFormatted).toBe('₹45,000.00');
    });

    it('GET /api/v1/budgets should return all user budgets', async () => {
      await request(app)
        .post('/api/v1/budgets')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          name: 'Monthly Limit',
          amountLimit: 45000,
        });

      const res = await request(app)
        .get('/api/v1/budgets')
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('PATCH /api/v1/budgets/:id should update budget limit', async () => {
      const createRes = await request(app)
        .post('/api/v1/budgets')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          name: 'Q4 Limit',
          amountLimit: 50000,
        });
      const budgetId = createRes.body.data.id;

      const updateRes = await request(app)
        .patch(`/api/v1/budgets/${budgetId}`)
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          amountLimit: 60000,
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.success).toBe(true);
      expect(updateRes.body.data.amountLimitRupees).toBe(60000);
    });
  });

  describe('Budget Calculations & Daily Allowance', () => {
    it('GET /api/v1/budgets/summary should calculate spent, remaining, and daily allowance', async () => {
      // 1. Create a monthly budget of ₹45,000
      await request(app)
        .post('/api/v1/budgets')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          name: 'Monthly Limit',
          amountLimit: 45000,
        });

      // 2. Add an expense of ₹28,450
      await request(app)
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          amount: 28450,
          type: 'expense',
          categoryId,
          title: 'Monthly Expenses',
        });

      // 3. Request summary
      const res = await request(app)
        .get('/api/v1/budgets/summary')
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.hasBudget).toBe(true);

      const b = res.body.data.budget;
      expect(b.amountLimitRupees).toBe(45000);
      expect(b.totalSpentRupees).toBe(28450);
      expect(b.remainingRupees).toBe(16550); // 45000 - 28450 = 16550
      expect(b.percentageUsed).toBe(63); // 28450 / 45000 = 63%
      expect(b.daysRemaining).toBeGreaterThan(0);
      expect(b.dailyAllowanceRupees).toBeGreaterThan(0);
      expect(b.warningStatus).toBe('safe');
    });
  });

  describe('Dashboard Analytics Endpoint', () => {
    it('GET /api/v1/budgets/dashboard should return complete home screen payload', async () => {
      // Create budget
      await request(app)
        .post('/api/v1/budgets')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          name: 'October Spend Limit',
          amountLimit: 45000,
        });

      // Add expense today
      await request(app)
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          amount: 840,
          type: 'expense',
          categoryId,
          title: 'Coffee and Lunch',
        });

      // Add income
      await request(app)
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          amount: 12000,
          type: 'income',
          categoryId,
          title: 'Design Retainer',
        });

      const res = await request(app)
        .get('/api/v1/budgets/dashboard')
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary.totalIncomeRupees).toBe(12000);
      expect(res.body.data.summary.totalExpensesRupees).toBe(840);
      expect(res.body.data.summary.netCashFlowRupees).toBe(11160);
      expect(res.body.data.monthlyBudget.hasBudget).toBe(true);
      expect(res.body.data.todaySpending.todaySpentRupees).toBe(840);
      expect(res.body.data.recentTransactions.length).toBeGreaterThan(0);
      expect(res.body.data.topCategories.length).toBeGreaterThan(0);
      expect(res.body.data.smartTip).toBeDefined();
    });
  });

  describe('Cross-User Budget Protection', () => {
    it('User B cannot access or modify User A budgets', async () => {
      const createRes = await request(app)
        .post('/api/v1/budgets')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          name: 'Private Budget',
          amountLimit: 50000,
        });
      const budgetId = createRes.body.data.id;

      // User B attempts to access User A's budget
      const getRes = await request(app)
        .get(`/api/v1/budgets/${budgetId}`)
        .set('Authorization', `Bearer ${tokenUserB}`);

      expect(getRes.status).toBe(403);
      expect(getRes.body.success).toBe(false);
      expect(getRes.body.error.code).toBe('FORBIDDEN');
    });
  });
});
