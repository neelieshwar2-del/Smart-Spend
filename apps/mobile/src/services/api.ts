import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import {
  DashboardData,
  Transaction,
  Category,
  RecurringRule,
  NotificationItem,
  CreateTransactionPayload,
  DEFAULT_CATEGORIES,
} from '../types';

// Dynamic Host Resolution: Supports EXPO_PUBLIC_API_URL, Expo Go LAN hostUri, Android Emulator 10.0.2.2, or localhost
const getBaseUrl = (): string => {
  const rawHost =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ||
    (Constants as any).manifest?.debuggerHost;
  const debuggerHost = typeof rawHost === 'string' ? rawHost.split(':')[0] : undefined;

  if (process.env.EXPO_PUBLIC_API_URL) {
    // On mobile devices, replace 'localhost' or '127.0.0.1' in EXPO_PUBLIC_API_URL with the LAN debuggerHost IP
    if (Platform.OS !== 'web' && debuggerHost) {
      return process.env.EXPO_PUBLIC_API_URL.replace(
        /localhost|127\.0\.0\.1/i,
        debuggerHost
      );
    }
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS !== 'web' && debuggerHost) {
    return `http://${debuggerHost}:4000/api/v1`;
  }
  if (Platform.OS === 'android') {
    // 10.0.2.2 maps to the host machine from the Android emulator
    return 'http://10.0.2.2:4000/api/v1';
  }
  return 'http://localhost:4000/api/v1';
};

const ACCESS_TOKEN_KEY = 'smartspend_access_token';
const REFRESH_TOKEN_KEY = 'smartspend_refresh_token';

const DEMO_USER = {
  name: 'Rohan Sharma',
  email: 'user@smartspend.app',
  password: 'Password123',
};

const formatINR = (paise: number): string => {
  const rupees = Number((paise / 100).toFixed(2));
  return (
    '₹' +
    rupees.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
};

class MobileApiClient {
  private baseUrl: string;
  private memoryToken: string | null | undefined = undefined;
  private authPromise: Promise<string | null> | null = null;
  private offlineUntil = 0;
  private offlineTransactions: Transaction[] = [];

  constructor() {
    this.baseUrl = getBaseUrl();
  }

  private isFastOffline(): boolean {
    return Date.now() < this.offlineUntil;
  }

  private markNetworkFailure(err: any): void {
    // Only mark offline if it was a network/timeout error (no HTTP status code)
    if (!err?.status) {
      this.offlineUntil = Date.now() + 30000; // Fast-fail to local store for 30s
    }
  }

  // --- Secure Token Storage (with in-memory cache to avoid native bridge overhead) ---
  async getAccessToken(): Promise<string | null> {
    if (this.memoryToken !== undefined) {
      return this.memoryToken;
    }
    try {
      if (Platform.OS === 'web') {
        this.memoryToken =
          typeof localStorage !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
      } else {
        this.memoryToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      }
      return this.memoryToken;
    } catch {
      this.memoryToken = null;
      return null;
    }
  }

  async setTokens(access: string, refresh: string): Promise<void> {
    this.memoryToken = access;
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(ACCESS_TOKEN_KEY, access);
          localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
        }
      } else {
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh);
      }
    } catch {
      // Ignore storage errors in restricted environments
    }
  }

  async clearTokens(): Promise<void> {
    this.memoryToken = null;
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
        }
      } else {
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }

  private async rawFetch<T>(endpoint: string, options: RequestInit = {}, token?: string | null): Promise<T> {
    if (this.isFastOffline()) {
      throw new Error('Fast offline fallback active');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s fast timeout

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      this.offlineUntil = 0;

      const json = await response.json();
      if (!response.ok) {
        const error: any = new Error(json.error?.message || `Request failed with status ${response.status}`);
        error.status = response.status;
        throw error;
      }
      return json.data as T;
    } catch (err: any) {
      clearTimeout(timeoutId);
      this.markNetworkFailure(err);
      throw err;
    }
  }

  // Automatically authenticate the default demo session when no token is stored yet
  private async ensureAuthenticated(): Promise<string | null> {
    const existing = await this.getAccessToken();
    if (existing) return existing;

    if (this.isFastOffline()) {
      return null;
    }

    if (this.authPromise) {
      return this.authPromise;
    }

    this.authPromise = (async () => {
      try {
        const loginRes = await this.rawFetch<any>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: DEMO_USER.email,
            password: DEMO_USER.password,
          }),
        });
        if (loginRes?.tokens?.accessToken) {
          await this.setTokens(loginRes.tokens.accessToken, loginRes.tokens.refreshToken);
          return loginRes.tokens.accessToken as string;
        }
      } catch (err: any) {
        // If user does not exist yet in DB (401/404), auto-register demo user
        if (err?.status === 401 || err?.status === 404) {
          try {
            const regRes = await this.rawFetch<any>('/auth/register', {
              method: 'POST',
              body: JSON.stringify(DEMO_USER),
            });
            if (regRes?.tokens?.accessToken) {
              await this.setTokens(regRes.tokens.accessToken, regRes.tokens.refreshToken);
              return regRes.tokens.accessToken as string;
            }
          } catch {
            // Ignore registration fallback error if offline
          }
        }
      } finally {
        this.authPromise = null;
      }
      return null;
    })();

    return this.authPromise;
  }

  // --- Low-level HTTP Request Wrapper ---
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (this.isFastOffline()) {
      throw new Error('Fast offline fallback active');
    }

    const isPublicEndpoint = endpoint.startsWith('/auth/') || endpoint.startsWith('/health');
    let token = isPublicEndpoint ? await this.getAccessToken() : await this.ensureAuthenticated();

    try {
      return await this.rawFetch<T>(endpoint, options, token);
    } catch (err: any) {
      // If token expired or server restarted in-memory auth, re-authenticate once
      if (!isPublicEndpoint && err?.status === 401) {
        await this.clearTokens();
        token = await this.ensureAuthenticated();
        if (token) {
          return await this.rawFetch<T>(endpoint, options, token);
        }
      }
      throw err;
    }
  }

  // --- Offline Fallback Builders ---
  private buildOfflineDashboard(): DashboardData {
    let totalIncome = 0;
    let totalExpenses = 0;
    let todaySpent = 0;
    const todayStr = new Date().toISOString().slice(0, 10);
    const catMap = new Map<string, { name: string; icon: string; color: string; amount: number }>();

    for (const t of this.offlineTransactions) {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else {
        totalExpenses += t.amount;
        if (t.transactionDate.startsWith(todayStr)) {
          todaySpent += t.amount;
        }
        const catName = t.categoryName || 'Food & Dining';
        const existing = catMap.get(catName) || {
          name: catName,
          icon: t.categoryIcon || 'utensils',
          color: t.categoryColor || '#F59E0B',
          amount: 0,
        };
        existing.amount += t.amount;
        catMap.set(catName, existing);
      }
    }

    const amountLimit = 4500000; // ₹45,000 in paise
    const remainingSafe = Math.max(0, amountLimit - totalExpenses);
    const percentageUsed = Math.min(100, Math.round((totalExpenses / amountLimit) * 100));
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const daysRemaining = Math.max(1, Math.ceil((endOfMonth.getTime() - now.getTime()) / 86400000));
    const dailyAllowance = Math.round(remainingSafe / daysRemaining);
    const dailyTarget = dailyAllowance > 0 ? dailyAllowance : 120000;
    const bufferRemaining = Math.max(0, dailyTarget - todaySpent);

    const topCategories = Array.from(catMap.values())
      .map((c) => ({
        ...c,
        amountFormatted: formatINR(c.amount),
        percentage: totalExpenses > 0 ? Math.round((c.amount / totalExpenses) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      summary: {
        totalIncome,
        totalIncomeFormatted: formatINR(totalIncome),
        totalExpenses,
        totalExpensesFormatted: formatINR(totalExpenses),
        netCashFlow: totalIncome - totalExpenses,
        netCashFlowFormatted: formatINR(totalIncome - totalExpenses),
      },
      monthlyBudget: {
        hasBudget: true,
        amountLimit,
        amountLimitFormatted: formatINR(amountLimit),
        totalSpent: totalExpenses,
        totalSpentFormatted: formatINR(totalExpenses),
        amountSpentFormatted: formatINR(totalExpenses),
        remainingSafe,
        remainingSafeFormatted: formatINR(remainingSafe),
        percentageUsed,
        percentageLeft: Math.max(0, 100 - percentageUsed),
        daysRemaining,
        dailyAllowance,
        dailyAllowanceFormatted: formatINR(dailyAllowance),
        warningStatus: percentageUsed >= 90 ? 'critical' : percentageUsed >= 75 ? 'warning' : 'safe',
      },
      todaySpending: {
        todaySpent,
        todaySpentFormatted: formatINR(todaySpent),
        dailyTarget,
        dailyTargetFormatted: formatINR(dailyTarget),
        bufferRemaining,
        bufferRemainingFormatted: formatINR(bufferRemaining),
        onTrack: todaySpent <= dailyTarget,
        percentageOfAllowance: Math.min(100, Math.round((todaySpent / dailyTarget) * 100)),
      },
      topCategories,
      recentTransactions: this.offlineTransactions.slice(0, 5),
      smartTip:
        this.offlineTransactions.length > 0
          ? `You have ${formatINR(bufferRemaining)} safe daily buffer remaining today.`
          : 'Add your first transaction to calculate budget insights and daily pacing.',
      upcomingSubscriptions: [],
    };
  }

  // --- Auth Endpoints ---
  async login(email: string, password: string) {
    this.offlineUntil = 0;
    const res = await this.rawFetch<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.tokens) {
      await this.setTokens(res.tokens.accessToken, res.tokens.refreshToken);
    }
    return res;
  }

  async register(name: string, email: string, password: string) {
    this.offlineUntil = 0;
    const res = await this.rawFetch<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    if (res.tokens) {
      await this.setTokens(res.tokens.accessToken, res.tokens.refreshToken);
    }
    return res;
  }

  // --- Dashboard & Financial Metrics ---
  async getDashboard(): Promise<DashboardData> {
    try {
      return await this.request<DashboardData>('/budgets/dashboard');
    } catch {
      return this.buildOfflineDashboard();
    }
  }

  // --- Transactions ---
  async getTransactions(params?: { search?: string; type?: string; categoryId?: string }): Promise<Transaction[]> {
    const cleanParams: Record<string, string> = {};
    if (params?.search && params.search.trim().length > 0) {
      cleanParams.search = params.search.trim();
    }
    if (params?.type && params.type !== 'all') {
      cleanParams.type = params.type;
    }
    if (params?.categoryId && params.categoryId.trim().length > 0) {
      cleanParams.categoryId = params.categoryId.trim();
    }

    const query = new URLSearchParams(cleanParams).toString();
    const endpoint = query ? `/transactions?${query}` : '/transactions';

    try {
      const res = await this.request<{ items: Transaction[] }>(endpoint);
      return (res.items || []).map((item: any) => ({
        ...item,
        categoryName: item.categoryName || item.category?.name || 'General',
        categoryIcon: item.categoryIcon || item.category?.icon || 'receipt',
        categoryColor: item.categoryColor || item.category?.color || '#555e74',
      }));
    } catch {
      return this.offlineTransactions.filter((t) => {
        if (cleanParams.type && t.type !== cleanParams.type) return false;
        if (
          cleanParams.search &&
          !t.title.toLowerCase().includes(cleanParams.search.toLowerCase()) &&
          !(t.merchant || '').toLowerCase().includes(cleanParams.search.toLowerCase())
        ) {
          return false;
        }
        return true;
      });
    }
  }

  async createTransaction(payload: CreateTransactionPayload): Promise<Transaction> {
    try {
      return await this.request<Transaction>('/transactions', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      const cat = DEFAULT_CATEGORIES.find((c) => c.id === payload.categoryId) || DEFAULT_CATEGORIES[0];
      const amountPaise = Math.round(payload.amount * 100);
      const localTxn: Transaction = {
        id: `local_${Date.now()}`,
        userId: 'user_1',
        type: payload.type,
        amount: amountPaise,
        amountRupees: payload.amount,
        amountFormatted: formatINR(amountPaise),
        categoryId: payload.categoryId,
        categoryName: cat.name,
        categoryIcon: cat.icon,
        categoryColor: cat.color,
        title: payload.title,
        merchant: payload.merchant || payload.title,
        note: payload.note || null,
        transactionDate: payload.transactionDate || new Date().toISOString(),
        paymentMethod: payload.paymentMethod,
      };
      this.offlineTransactions = [localTxn, ...this.offlineTransactions];
      return localTxn;
    }
  }

  async deleteTransaction(id: string): Promise<boolean> {
    try {
      await this.request(`/transactions/${id}`, { method: 'DELETE' });
    } catch {
      this.offlineTransactions = this.offlineTransactions.filter((t) => t.id !== id);
    }
    return true;
  }

  // --- Categories ---
  async getCategories(): Promise<Category[]> {
    try {
      const res = await this.request<Category[]>('/categories');
      return res && res.length > 0 ? res : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  }

  // --- Recurring Subscriptions ---
  async getRecurring(): Promise<RecurringRule[]> {
    try {
      const res = await this.request<RecurringRule[]>('/recurring');
      return res || [];
    } catch {
      return [];
    }
  }

  // --- Notifications ---
  async getNotifications(): Promise<NotificationItem[]> {
    try {
      const res = await this.request<NotificationItem[]>('/notifications');
      return res || [];
    } catch {
      return [];
    }
  }

  // --- AI Financial Assistant ---
  async chatAi(message: string): Promise<{ answer: string; model: string; metrics: any }> {
    try {
      return await this.request<any>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
    } catch {
      const dash = this.buildOfflineDashboard();
      return {
        answer: `Based on your current budget, you have ${dash.monthlyBudget.remainingSafeFormatted} remaining this month (${dash.todaySpending.bufferRemainingFormatted} safe daily buffer today).`,
        model: 'smartspend-local-copilot',
        metrics: {
          totalExpense: dash.summary.totalExpensesFormatted,
          remainingBudget: dash.monthlyBudget.remainingSafeFormatted,
          topCategory: dash.topCategories[0]?.name || 'Food & Dining',
        },
      };
    }
  }
}

export const api = new MobileApiClient();
