import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import {
  DashboardData,
  Transaction,
  Category,
  RecurringRule,
  NotificationItem,
  CreateTransactionPayload,
  AiChatMessage,
} from '../types';

// Dynamic Host Resolution: Supports EXPO_PUBLIC_API_URL env var, Android Emulator 10.0.2.2, or localhost
const getBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === 'android') {
    // 10.0.2.2 maps to the host machine from the Android emulator
    return 'http://10.0.2.2:4000/api/v1';
  }
  return 'http://localhost:4000/api/v1';
};

const ACCESS_TOKEN_KEY = 'smartspend_access_token';
const REFRESH_TOKEN_KEY = 'smartspend_refresh_token';

class MobileApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getBaseUrl();
  }

  // --- Secure Token Storage ---
  async getAccessToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return typeof localStorage !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
      }
      return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  async setTokens(access: string, refresh: string): Promise<void> {
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
    } catch (e) {
      console.warn('Failed to save tokens:', e);
    }
  }

  async clearTokens(): Promise<void> {
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
    } catch (e) {
      console.warn('Failed to delete tokens:', e);
    }
  }

  // --- Low-level HTTP Request Wrapper ---
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error?.message || `Request failed with status ${response.status}`);
      }
      return json.data as T;
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.warn(`[API] Endpoint ${endpoint} error:`, err.message || err);
      throw err;
    }
  }

  // --- Auth Endpoints ---
  async login(email: string, password: string) {
    const res = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.tokens) {
      await this.setTokens(res.tokens.accessToken, res.tokens.refreshToken);
    }
    return res;
  }

  async register(name: string, email: string, password: string) {
    const res = await this.request<any>('/auth/register', {
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
    return await this.request<DashboardData>('/budgets/dashboard');
  }

  // --- Transactions ---
  async getTransactions(params?: { search?: string; type?: string; categoryId?: string }): Promise<Transaction[]> {
    const query = new URLSearchParams(params as any).toString();
    const res = await this.request<{ items: Transaction[] }>(`/transactions?${query}`);
    return res.items || [];
  }

  async createTransaction(payload: CreateTransactionPayload): Promise<Transaction> {
    return await this.request<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async deleteTransaction(id: string): Promise<boolean> {
    await this.request(`/transactions/${id}`, { method: 'DELETE' });
    return true;
  }

  // --- Categories ---
  async getCategories(): Promise<Category[]> {
    const res = await this.request<Category[]>('/categories');
    return res || [];
  }

  // --- Recurring Subscriptions ---
  async getRecurring(): Promise<RecurringRule[]> {
    const res = await this.request<RecurringRule[]>('/recurring');
    return res || [];
  }

  // --- Notifications ---
  async getNotifications(): Promise<NotificationItem[]> {
    const res = await this.request<NotificationItem[]>('/notifications');
    return res || [];
  }

  // --- AI Financial Assistant ---
  async chatAi(message: string): Promise<{ answer: string; model: string; metrics: any }> {
    return await this.request<any>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }
}

export const api = new MobileApiClient();
