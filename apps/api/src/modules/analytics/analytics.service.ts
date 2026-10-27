import {
  AnalyticsQueryParams,
  TrailingMonthsQueryParams,
  TrendsQueryParams,
} from './analytics.schema.js';
import { transactionRepository, TransactionRecord } from '../transactions/transaction.repository.js';
import { paiseToRupees, formatINR } from '../../utils/money.js';

export interface DateRange {
  startDate: Date;
  endDate: Date;
  daysInPeriod: number;
  daysElapsed: number;
}

export class AnalyticsService {
  private resolveDateRange(params: AnalyticsQueryParams): DateRange {
    const now = new Date();

    if (params.startDate && params.endDate) {
      const s = new Date(params.startDate);
      const e = new Date(params.endDate);
      const days = Math.max(1, Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)));
      const elapsed = Math.max(1, Math.min(days, Math.ceil((Math.min(now.getTime(), e.getTime()) - s.getTime()) / (1000 * 60 * 60 * 24))));
      return { startDate: s, endDate: e, daysInPeriod: days, daysElapsed: elapsed };
    }

    if (params.month && params.year) {
      const s = new Date(params.year, params.month - 1, 1, 0, 0, 0, 0);
      const e = new Date(params.year, params.month, 0, 23, 59, 59, 999);
      const days = e.getDate();
      const isCurrentMonth = now.getFullYear() === params.year && (now.getMonth() + 1) === params.month;
      const elapsed = isCurrentMonth ? now.getDate() : days;
      return { startDate: s, endDate: e, daysInPeriod: days, daysElapsed: elapsed };
    }

    switch (params.period) {
      case 'last_month': {
        const s = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
        const e = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        const days = e.getDate();
        return { startDate: s, endDate: e, daysInPeriod: days, daysElapsed: days };
      }
      case 'last_30_days': {
        const s = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        s.setHours(0, 0, 0, 0);
        const e = new Date(now.getTime());
        return { startDate: s, endDate: e, daysInPeriod: 30, daysElapsed: 30 };
      }
      case 'last_90_days': {
        const s = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
        s.setHours(0, 0, 0, 0);
        const e = new Date(now.getTime());
        return { startDate: s, endDate: e, daysInPeriod: 90, daysElapsed: 90 };
      }
      case 'this_year': {
        const s = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
        const e = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        const startOfYear = s.getTime();
        const daysElapsed = Math.max(1, Math.ceil((now.getTime() - startOfYear) / (1000 * 60 * 60 * 24)));
        const daysInYear = ((now.getFullYear() % 4 === 0 && now.getFullYear() % 100 !== 0) || now.getFullYear() % 400 === 0) ? 366 : 365;
        return { startDate: s, endDate: e, daysInPeriod: daysInYear, daysElapsed };
      }
      case 'this_month':
      default: {
        const s = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        const e = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        const days = e.getDate();
        const elapsed = Math.max(1, now.getDate());
        return { startDate: s, endDate: e, daysInPeriod: days, daysElapsed: elapsed };
      }
    }
  }

  async getOverview(userId: string, params: AnalyticsQueryParams) {
    const range = this.resolveDateRange(params);

    const txnsResult = await transactionRepository.list(userId, {
      page: 1,
      startDate: range.startDate.toISOString(),
      endDate: range.endDate.toISOString(),
      limit: 5000,
      sortBy: 'transactionDate',
      sortOrder: 'asc',
    });

    let totalIncome = 0;
    let totalExpense = 0;
    const catMap: { [id: string]: { name: string; icon: string; color: string; amount: number; count: number } } = {};

    for (const txn of txnsResult.items) {
      if (txn.type === 'income') {
        totalIncome += txn.amount;
      } else {
        totalExpense += txn.amount;
        const cId = txn.categoryId;
        if (!catMap[cId]) {
          catMap[cId] = {
            name: txn.category?.name || 'Uncategorized',
            icon: txn.category?.icon || '📁',
            color: txn.category?.color || '#94a3b8',
            amount: 0,
            count: 0,
          };
        }
        catMap[cId].amount += txn.amount;
        catMap[cId].count++;
      }
    }

    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netSavings / totalIncome) * 100)) : 0;
    const averageDailySpend = Math.round(totalExpense / Math.max(1, range.daysElapsed));
    const projectedEndOfMonthSpend = Math.round(averageDailySpend * range.daysInPeriod);

    // Highest spending category
    let highestCat: any = null;
    let maxCatAmount = -1;
    for (const [id, data] of Object.entries(catMap)) {
      if (data.amount > maxCatAmount) {
        maxCatAmount = data.amount;
        highestCat = {
          categoryId: id,
          ...data,
          amountRupees: paiseToRupees(data.amount),
          amountFormatted: formatINR(data.amount),
          percentage: totalExpense > 0 ? Math.round((data.amount / totalExpense) * 100) : 0,
        };
      }
    }

    // Month-over-month / previous period change
    const periodDuration = range.endDate.getTime() - range.startDate.getTime();
    const prevStart = new Date(range.startDate.getTime() - periodDuration);
    const prevEnd = new Date(range.startDate.getTime() - 1);

    const prevTxns = await transactionRepository.list(userId, {
      page: 1,
      startDate: prevStart.toISOString(),
      endDate: prevEnd.toISOString(),
      type: 'expense',
      limit: 5000,
    });

    let previousExpense = 0;
    for (const tx of prevTxns.items) {
      previousExpense += tx.amount;
    }

    const expenseChangePercent = previousExpense > 0
      ? Math.round(((totalExpense - previousExpense) / previousExpense) * 100)
      : 0;

    return {
      period: {
        startDate: range.startDate.toISOString(),
        endDate: range.endDate.toISOString(),
        daysInPeriod: range.daysInPeriod,
        daysElapsed: range.daysElapsed,
      },
      summary: {
        totalIncome,
        totalIncomeRupees: paiseToRupees(totalIncome),
        totalIncomeFormatted: formatINR(totalIncome),

        totalExpense,
        totalExpenseRupees: paiseToRupees(totalExpense),
        totalExpenseFormatted: formatINR(totalExpense),

        netSavings,
        netSavingsRupees: paiseToRupees(netSavings),
        netSavingsFormatted: formatINR(netSavings),

        savingsRate,
        averageDailySpend,
        averageDailySpendRupees: paiseToRupees(averageDailySpend),
        averageDailySpendFormatted: formatINR(averageDailySpend),

        projectedEndOfMonthSpend,
        projectedEndOfMonthSpendRupees: paiseToRupees(projectedEndOfMonthSpend),
        projectedEndOfMonthSpendFormatted: formatINR(projectedEndOfMonthSpend),

        previousExpense,
        previousExpenseRupees: paiseToRupees(previousExpense),
        previousExpenseFormatted: formatINR(previousExpense),
        expenseChangePercent,
      },
      highestSpendingCategory: highestCat,
      transactionCount: txnsResult.items.length,
    };
  }

  async getDaily(userId: string, params: AnalyticsQueryParams) {
    const range = this.resolveDateRange(params);

    const txnsResult = await transactionRepository.list(userId, {
      page: 1,
      startDate: range.startDate.toISOString(),
      endDate: range.endDate.toISOString(),
      limit: 5000,
      sortBy: 'transactionDate',
      sortOrder: 'asc',
    });

    // Initialize map of all days in range
    const dailyMap: { [dateStr: string]: { date: string; expense: number; income: number; count: number } } = {};
    const curr = new Date(range.startDate);
    while (curr <= range.endDate) {
      const dStr = curr.toISOString().split('T')[0];
      dailyMap[dStr] = { date: dStr, expense: 0, income: 0, count: 0 };
      curr.setDate(curr.getDate() + 1);
    }

    for (const tx of txnsResult.items) {
      const dStr = new Date(tx.transactionDate).toISOString().split('T')[0];
      if (!dailyMap[dStr]) {
        dailyMap[dStr] = { date: dStr, expense: 0, income: 0, count: 0 };
      }
      if (tx.type === 'income') {
        dailyMap[dStr].income += tx.amount;
      } else {
        dailyMap[dStr].expense += tx.amount;
      }
      dailyMap[dStr].count++;
    }

    const days = Object.values(dailyMap).map(d => ({
      ...d,
      expenseRupees: paiseToRupees(d.expense),
      expenseFormatted: formatINR(d.expense),
      incomeRupees: paiseToRupees(d.income),
      incomeFormatted: formatINR(d.income),
      net: d.income - d.expense,
      netFormatted: formatINR(d.income - d.expense),
    }));

    return {
      period: {
        startDate: range.startDate.toISOString(),
        endDate: range.endDate.toISOString(),
      },
      days,
    };
  }

  async getMonthly(userId: string, query: TrailingMonthsQueryParams) {
    const numMonths = query.months || 6;
    const now = new Date();
    const result = [];

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = numMonths - 1; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth() + 1; // 1-indexed

      const s = new Date(year, month - 1, 1, 0, 0, 0, 0);
      const e = new Date(year, month, 0, 23, 59, 59, 999);

      const txns = await transactionRepository.list(userId, {
        page: 1,
        startDate: s.toISOString(),
        endDate: e.toISOString(),
        limit: 5000,
      });

      let income = 0;
      let expense = 0;
      for (const t of txns.items) {
        if (t.type === 'income') income += t.amount;
        else expense += t.amount;
      }

      const net = income - expense;
      const savingsRate = income > 0 ? Math.max(0, Math.round((net / income) * 100)) : 0;

      result.push({
        year,
        month,
        monthLabel: `${monthNames[month - 1]} ${year}`,
        income,
        incomeRupees: paiseToRupees(income),
        incomeFormatted: formatINR(income),
        expense,
        expenseRupees: paiseToRupees(expense),
        expenseFormatted: formatINR(expense),
        net,
        netRupees: paiseToRupees(net),
        netFormatted: formatINR(net),
        savingsRate,
        transactionCount: txns.items.length,
      });
    }

    return {
      months: result,
    };
  }

  async getCategories(userId: string, params: AnalyticsQueryParams) {
    const range = this.resolveDateRange(params);

    const txnsResult = await transactionRepository.list(userId, {
      page: 1,
      startDate: range.startDate.toISOString(),
      endDate: range.endDate.toISOString(),
      type: 'expense',
      limit: 5000,
    });

    let totalExpense = 0;
    const map: { [id: string]: { id: string; name: string; icon: string; color: string; amount: number; count: number } } = {};

    for (const t of txnsResult.items) {
      totalExpense += t.amount;
      const cId = t.categoryId;
      if (!map[cId]) {
        map[cId] = {
          id: cId,
          name: t.category?.name || 'Other',
          icon: t.category?.icon || '📁',
          color: t.category?.color || '#94a3b8',
          amount: 0,
          count: 0,
        };
      }
      map[cId].amount += t.amount;
      map[cId].count++;
    }

    const categories = Object.values(map)
      .map(c => ({
        categoryId: c.id,
        name: c.name,
        icon: c.icon,
        color: c.color,
        amount: c.amount,
        amountRupees: paiseToRupees(c.amount),
        amountFormatted: formatINR(c.amount),
        transactionCount: c.count,
        percentage: totalExpense > 0 ? Math.round((c.amount / totalExpense) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      period: {
        startDate: range.startDate.toISOString(),
        endDate: range.endDate.toISOString(),
      },
      totalExpense,
      totalExpenseRupees: paiseToRupees(totalExpense),
      totalExpenseFormatted: formatINR(totalExpense),
      categories,
    };
  }

  async getTrends(userId: string, query: TrendsQueryParams) {
    const range = this.resolveDateRange({ period: query.period });

    const txnsResult = await transactionRepository.list(userId, {
      page: 1,
      startDate: range.startDate.toISOString(),
      endDate: range.endDate.toISOString(),
      limit: 5000,
    });

    const dayOfWeekNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeekMap: { [day: string]: { dayName: string; amount: number; count: number } } = {};
    for (const d of dayOfWeekNames) {
      dayOfWeekMap[d] = { dayName: d, amount: 0, count: 0 };
    }

    const merchantMap: { [merchant: string]: { name: string; amount: number; count: number } } = {};
    const paymentMethodMap: { [method: string]: { method: string; amount: number; count: number } } = {};

    let totalExpense = 0;
    let expenseCount = 0;

    for (const t of txnsResult.items) {
      if (t.type === 'expense') {
        totalExpense += t.amount;
        expenseCount++;

        const dayName = dayOfWeekNames[new Date(t.transactionDate).getDay()];
        dayOfWeekMap[dayName].amount += t.amount;
        dayOfWeekMap[dayName].count++;

        const merchant = t.merchant || t.title;
        if (!merchantMap[merchant]) {
          merchantMap[merchant] = { name: merchant, amount: 0, count: 0 };
        }
        merchantMap[merchant].amount += t.amount;
        merchantMap[merchant].count++;

        const method = t.paymentMethod || 'UPI';
        if (!paymentMethodMap[method]) {
          paymentMethodMap[method] = { method, amount: 0, count: 0 };
        }
        paymentMethodMap[method].amount += t.amount;
        paymentMethodMap[method].count++;
      }
    }

    const averageTransactionSize = expenseCount > 0 ? Math.round(totalExpense / expenseCount) : 0;

    const busiestDays = Object.values(dayOfWeekMap).sort((a, b) => b.amount - a.amount);
    const topMerchants = Object.values(merchantMap)
      .map(m => ({
        ...m,
        amountRupees: paiseToRupees(m.amount),
        amountFormatted: formatINR(m.amount),
        percentage: totalExpense > 0 ? Math.round((m.amount / totalExpense) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const paymentMethods = Object.values(paymentMethodMap)
      .map(p => ({
        ...p,
        amountRupees: paiseToRupees(p.amount),
        amountFormatted: formatINR(p.amount),
        percentage: totalExpense > 0 ? Math.round((p.amount / totalExpense) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      period: query.period,
      totalExpense,
      totalExpenseFormatted: formatINR(totalExpense),
      averageTransactionSize,
      averageTransactionSizeFormatted: formatINR(averageTransactionSize),
      busiestDay: busiestDays[0] || null,
      dayOfWeekBreakdown: Object.values(dayOfWeekMap),
      topMerchants,
      paymentMethods,
    };
  }

  async getCashFlow(userId: string, query: TrailingMonthsQueryParams) {
    const monthlyData = await this.getMonthly(userId, query);

    let cumulativeBalance = 0;
    const flow = monthlyData.months.map(m => {
      cumulativeBalance += m.net;
      return {
        monthLabel: m.monthLabel,
        inflow: m.income,
        inflowFormatted: m.incomeFormatted,
        outflow: m.expense,
        outflowFormatted: m.expenseFormatted,
        netFlow: m.net,
        netFlowFormatted: m.netFormatted,
        cumulativeBalance,
        cumulativeBalanceFormatted: formatINR(cumulativeBalance),
      };
    });

    return {
      cashFlow: flow,
    };
  }
}

export const analyticsService = new AnalyticsService();
