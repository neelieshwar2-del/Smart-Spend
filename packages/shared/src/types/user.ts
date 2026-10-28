export interface User {
  id: string;
  name: string;
  email: string;
  currency: string;
  timezone: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserSession {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  };
}
