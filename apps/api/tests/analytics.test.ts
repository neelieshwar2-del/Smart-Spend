import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { authRepository } from '../src/modules/auth/auth.repository.js';
import { categoryRepository } from '../src/modules/categories/category.repository.js';
import { transactionRepository } from '../src/modules/transactions/transaction.repository.js';

describe('Analytics and Financial Insights API', () => {
  let tokenUser: string;
  let foodCatId: string;
  let shoppingCatId: string;
  let salaryCatId: string;

  beforeEach(async () => {
    authRepository.clearMemory();
    categoryRepository.clearMemory();
    transactionRepository.clearMemory();

    // Register test user
    const reg = await request(app).post('/api/v1/auth/register').send({
      name: 'Ananya Iyer',
      email: 'ananya.iyer@fintech.io',
      password: 'Password123',
    });
    tokenUser = reg.body.data.tokens.accessToken;

    // Fetch categories
    const catRes = await request(app)
      .get('/api/v1/categories')
      .set('Authorization', `Bearer ${tokenUser}`);

    foodCatId = catRes.body.data.find((c: any) => c.name === 'Food & Dining')?.id || catRes.body.data[0].id;
    shoppingCatId = catRes.body.data.find((c: any) => c.name === 'Shopping')?.id || catRes.body.data[1].id;
    salaryCatId = catRes.body.data.find((c: any) => c.name === 'Salary')?.id || catRes.body.data[2].id;

    // Seed test transactions in current month
    const today = new Date();

    // 1. Income (Salary ₹60,000)
    await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${tokenUser}`)
      .send({
        type: 'income',
        amount: 60000,
        categoryId: salaryCatId,
        title: 'Monthly Salary Credit',
        transactionDate: new Date(today.getFullYear(), today.getMonth(), 1).toISOString(),
        paymentMethod: 'Bank Transfer',
      });

    // 2. Expense 1 (Food ₹6,000)
    await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${tokenUser}`)
      .send({
        type: 'expense',
        amount: 6000,
        categoryId: foodCatId,
        title: 'Swiggy Gourmet Orders',
        merchant: 'Swiggy',
        transactionDate: new Date(today.getFullYear(), today.getMonth(), 5).toISOString(),
        paymentMethod: 'UPI',
      });

    // 3. Expense 2 (Shopping ₹4,000)
    await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${tokenUser}`)
      .send({
        type: 'expense',
        amount: 4000,
        categoryId: shoppingCatId,
        title: 'Zara Clothing',
        merchant: 'Zara',
        transactionDate: new Date(today.getFullYear(), today.getMonth(), 10).toISOString(),
        paymentMethod: 'Credit Card',
      });
  });

  describe('GET /api/v1/analytics/overview', () => {
    it('should compute comprehensive overview including net savings, savings rate, and top category', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/overview')
        .query({ period: 'this_month' })
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const summary = res.body.data.summary;
      // Income: 6000000 paise (₹60,000.00)
      expect(summary.totalIncome).toBe(6000000);
      expect(summary.totalIncomeRupees).toBe(60000);

      // Expenses: 600000 + 400000 = 1000000 paise (₹10,000.00)
      expect(summary.totalExpense).toBe(1000000);
      expect(summary.totalExpenseRupees).toBe(10000);

      // Net Savings: 5000000 paise (₹50,000.00)
      expect(summary.netSavings).toBe(5000000);
      expect(summary.netSavingsRupees).toBe(50000);

      // Savings Rate: (50000 / 60000) * 100 ~ 83%
      expect(summary.savingsRate).toBe(83);

      // Average daily spend and projected spend exist and are numbers
      expect(summary.averageDailySpend).toBeGreaterThan(0);
      expect(summary.projectedEndOfMonthSpend).toBeGreaterThan(0);

      // Highest Spending Category is Food & Dining
      const topCat = res.body.data.highestSpendingCategory;
      expect(topCat).toBeDefined();
      expect(topCat.categoryId).toBe(foodCatId);
      expect(topCat.amountRupees).toBe(6000);
      expect(topCat.percentage).toBe(60); // 6,000 out of 10,000 = 60%
    });
  });

  describe('GET /api/v1/analytics/daily', () => {
    it('should return continuous timeline breakdown for the period', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/daily')
        .query({ period: 'this_month' })
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.days)).toBe(true);
      expect(res.body.data.days.length).toBeGreaterThan(0);

      // Check format of day entry
      const firstDay = res.body.data.days[0];
      expect(firstDay.date).toBeDefined();
      expect(typeof firstDay.expense).toBe('number');
      expect(typeof firstDay.income).toBe('number');
      expect(typeof firstDay.net).toBe('number');
      expect(firstDay.expenseFormatted).toContain('₹');
    });
  });

  describe('GET /api/v1/analytics/monthly', () => {
    it('should return trailing months breakdown with savings rates', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/monthly')
        .query({ months: 6 })
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.months.length).toBe(6);

      // Current month should have income & expense
      const currentMonthData = res.body.data.months[res.body.data.months.length - 1];
      expect(currentMonthData.incomeRupees).toBe(60000);
      expect(currentMonthData.expenseRupees).toBe(10000);
      expect(currentMonthData.netRupees).toBe(50000);
      expect(currentMonthData.savingsRate).toBe(83);
    });
  });

  describe('GET /api/v1/analytics/categories', () => {
    it('should return category breakdown sorted descending by amount', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/categories')
        .query({ period: 'this_month' })
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const cats = res.body.data.categories;
      expect(cats.length).toBe(2);
      expect(cats[0].categoryId).toBe(foodCatId);
      expect(cats[0].percentage).toBe(60);
      expect(cats[1].categoryId).toBe(shoppingCatId);
      expect(cats[1].percentage).toBe(40);
    });
  });

  describe('GET /api/v1/analytics/trends', () => {
    it('should calculate busiest day, top merchants, and payment methods', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/trends')
        .query({ period: 'this_month' })
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.averageTransactionSize).toBeGreaterThan(0);
      expect(res.body.data.busiestDay).toBeDefined();

      const topMerchants = res.body.data.topMerchants;
      expect(topMerchants.length).toBe(2);
      expect(topMerchants[0].name).toBe('Swiggy');
      expect(topMerchants[0].amountRupees).toBe(6000);
    });
  });

  describe('GET /api/v1/analytics/cash-flow', () => {
    it('should compute inflow, outflow, and cumulative balance', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/cash-flow')
        .query({ months: 6 })
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.cashFlow.length).toBe(6);

      const latestMonth = res.body.data.cashFlow[res.body.data.cashFlow.length - 1];
      expect(latestMonth.inflow).toBe(6000000);
      expect(latestMonth.outflow).toBe(1000000);
      expect(latestMonth.netFlow).toBe(5000000);
      expect(latestMonth.cumulativeBalance).toBe(5000000);
    });
  });

  describe('Authentication Enforcement', () => {
    it('should reject unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/v1/analytics/overview');
      expect(res.status).toBe(401);
    });
  });
});
