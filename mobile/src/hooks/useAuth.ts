import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>({
    id: 'user_1',
    name: 'Rohan Sharma',
    email: 'user@smartspend.app',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    createdAt: new Date().toISOString(),
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, pass);
      if (res.user) {
        setUser(res.user);
        setIsAuthenticated(true);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await api.clearTokens();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
};
