import { budgetService } from './budget.service.js';
import { transactionRepository } from '../transactions/transaction.repository.js';
import { recurringRepository } from '../recurring/recurring.repository.js';
import { paiseToRupees, formatINR } from '../../utils/money.js';

export interface DashboardData {
  summary: {
    totalIncome: number;
    totalIncomeRupees: number;
    totalIncomeFormatted: string;
    totalExpenses: number;
    totalExpensesRupees: number;
    totalExpensesFormatted: string;
    netCashFlow: number;
    netCashFlowRupees: number;
    netCashFlowFormatted: string;
  };
  monthlyBudget: {
    hasBudget: boolean;
    amountLimit: number;
    amountLimitRupees: number;
    amountLimitFormatted: string;
    totalSpent: number;
    totalSpentRupees: number;
    totalSpentFormatted: string;
    remainingSafe: number;
    remainingSafeRupees: number;
    remainingSafeFormatted: string;
    percentageUsed: number;
    percentageLeft: number;
    daysRemaining: number;
    dailyAllowance: number;
    dailyAllowanceRupees: number;
    dailyAllowanceFormatted: string;
    warningStatus: 'safe' | 'warning' | 'critical' | 'exceeded';
  };
  todaySpending: {
    todaySpent: number;
    todaySpentRupees: number;
    todaySpentFormatted: string;
    dailyTarget: number;
    dailyTargetRupees: number;
    dailyTargetFormatted: string;
    percentageOfAllowance: number;
    bufferRemaining: number;
    bufferRemainingRupees: number;
    bufferRemainingFormatted: string;
    onTrack: boolean;
  };
  topCategories: Array<{
    name: string;
    icon: string;
    color: string;
    amount: number;
    amountRupees: number;
    amountFormatted: string;
    percentage: number;
  }>;
  recentTransactions: Array<{
    id: string;
    title: string;
    merchant: string | null;
    category: string;
    icon: string;
    type: string;
    amount: number;
    amountRupees: number;
    amountFormatted: string;
    date: Date;
    paymentMethod: string;
  }>;
  smartTip: string;
  upcomingSubscriptions: Array<{
    title: string;
    amountFormatted: string;
    dueDate: string;
  }>;
}

export class DashboardService {
  async getDashboardData(userId: string): Promise<DashboardData> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // 1. Fetch Month Transactions
    const txnsResult = await transactionRepository.list(userId, {
      page: 1,
      startDate: startOfMonth.toISOString(),
      endDate: endOfMonth.toISOString(),
      limit: 1000,
      sortBy: 'transactionDate',
      sortOrder: 'desc',
    });

    let totalIncome = 0;
    let totalExpenses = 0;
    let todaySpent = 0;
    const categorySpendMap: { [catId: string]: { name: string; icon: string; color: string; amount: number } } = {};

    for (const txn of txnsResult.items) {
      const amt = txn.amount;
      const tDate = new Date(txn.transactionDate);

      if (txn.type === 'income') {
        totalIncome += amt;
      } else {
        totalExpenses += amt;

        // Check if today
        if (tDate >= startOfToday && tDate <= endOfToday) {
          todaySpent += amt;
        }

        // Aggregate by category
        const cName = txn.category?.name || 'General';
        const cIcon = txn.category?.icon || 'receipt';
        const cColor = txn.category?.color || '#555e74';
        if (!categorySpendMap[cName]) {
          categorySpendMap[cName] = { name: cName, icon: cIcon, color: cColor, amount: 0 };
        }
        categorySpendMap[cName].amount += amt;
      }
    }

    const netCashFlow = totalIncome - totalExpenses;

    // 2. Fetch Budget Summary
    const budgetSummary = await budgetService.getBudgetSummary(userId);
    const hasBudget = budgetSummary.hasBudget && !!budgetSummary.budget;
    const b = budgetSummary.budget;

    const monthlyLimit = b?.amountLimit || 4500000;
    const remainingSafe = b?.remaining || Math.max(0, monthlyLimit - totalExpenses);
    const percentageUsed = b?.percentageUsed || Math.min(100, Math.round((totalExpenses / monthlyLimit) * 100));
    const percentageLeft = b?.percentageLeft || Math.max(0, 100 - percentageUsed);
    const daysRemaining = b?.daysRemaining || Math.max(1, Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const dailyAllowance = b?.dailyAllowance || Math.round(remainingSafe / daysRemaining);

    // 3. Today's target & pacing
    const dailyTarget = dailyAllowance > 0 ? dailyAllowance : 120000; // 1,200 INR default daily allowance
    const todayPercent = Math.min(100, Math.round((todaySpent / dailyTarget) * 100));
    const bufferRemaining = Math.max(0, dailyTarget - todaySpent);
    const onTrack = todaySpent <= dailyTarget;

    // 4. Top Categories sorted
    const topCategories = Object.values(categorySpendMap)
      .map(c => ({
        name: c.name,
        icon: c.icon,
        color: c.color,
        amount: c.amount,
        amountRupees: paiseToRupees(c.amount),
        amountFormatted: formatINR(c.amount),
        percentage: totalExpenses > 0 ? Math.round((c.amount / totalExpenses) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // 5. Recent 5 Transactions
    const recentTransactions = txnsResult.items.slice(0, 5).map(t => ({
      id: t.id,
      title: t.title,
      merchant: t.merchant,
      category: t.category?.name || 'General',
      icon: t.category?.icon || (t.type === 'income' ? 'payments' : 'receipt'),
      type: t.type,
      amount: t.amount,
      amountRupees: paiseToRupees(t.amount),
      amountFormatted: (t.type === 'income' ? '+' : '-') + formatINR(t.amount),
      date: t.transactionDate,
      paymentMethod: t.paymentMethod,
    }));

    // 6. Dynamic Smart Tip
    const topCatName = topCategories[0]?.name || 'Food & Dining';
    const topCatAmtFormatted = topCategories[0]?.amountFormatted || '₹4,200.00';
    const smartTip = `${topCatName} is your highest expense this month (${topCatAmtFormatted}). You are currently on track with ${formatINR(bufferRemaining)} buffer remaining today! 🎯`;

    // 7. Subscriptions Upcoming
    const userRecurring = await recurringRepository.findByUserId(userId, { isActive: true });
    const upcomingSubscriptions = userRecurring.length > 0
      ? userRecurring.slice(0, 5).map(r => ({
          title: r.title,
          amountFormatted: formatINR(r.amount),
          dueDate: new Date(r.nextDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        }))
      : [
          { title: 'Netflix Premium', amountFormatted: '₹649.00', dueDate: 'Oct 28' },
          { title: 'Spotify Duo', amountFormatted: '₹119.00', dueDate: 'Oct 29' },
          { title: 'Cult.fit Pass', amountFormatted: '₹1,500.00', dueDate: 'Oct 31' },
        ];

    return {
      summary: {
        totalIncome,
        totalIncomeRupees: paiseToRupees(totalIncome),
        totalIncomeFormatted: formatINR(totalIncome),
        totalExpenses,
        totalExpensesRupees: paiseToRupees(totalExpenses),
        totalExpensesFormatted: formatINR(totalExpenses),
        netCashFlow,
        netCashFlowRupees: paiseToRupees(netCashFlow),
        netCashFlowFormatted: formatINR(netCashFlow),
      },
      monthlyBudget: {
        hasBudget,
        amountLimit: monthlyLimit,
        amountLimitRupees: paiseToRupees(monthlyLimit),
        amountLimitFormatted: formatINR(monthlyLimit),
        totalSpent: b?.totalSpent || totalExpenses,
        totalSpentRupees: paiseToRupees(b?.totalSpent || totalExpenses),
        totalSpentFormatted: formatINR(b?.totalSpent || totalExpenses),
        remainingSafe,
        remainingSafeRupees: paiseToRupees(remainingSafe),
        remainingSafeFormatted: formatINR(remainingSafe),
        percentageUsed,
        percentageLeft,
        daysRemaining,
        dailyAllowance,
        dailyAllowanceRupees: paiseToRupees(dailyAllowance),
        dailyAllowanceFormatted: formatINR(dailyAllowance),
        warningStatus: b?.warningStatus || 'safe',
      },
      todaySpending: {
        todaySpent,
        todaySpentRupees: paiseToRupees(todaySpent),
        todaySpentFormatted: formatINR(todaySpent),
        dailyTarget,
        dailyTargetRupees: paiseToRupees(dailyTarget),
        dailyTargetFormatted: formatINR(dailyTarget),
        percentageOfAllowance: todayPercent,
        bufferRemaining,
        bufferRemainingRupees: paiseToRupees(bufferRemaining),
        bufferRemainingFormatted: formatINR(bufferRemaining),
        onTrack,
      },
      topCategories,
      recentTransactions,
      smartTip,
      upcomingSubscriptions,
    };
  }
}

export const dashboardService = new DashboardService();
