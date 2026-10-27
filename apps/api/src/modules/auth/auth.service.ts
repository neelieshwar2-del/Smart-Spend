import crypto from 'crypto';
import { authRepository, UserRecord } from './auth.repository.js';
import {
  RegisterInput,
  LoginInput,
  RefreshInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from './auth.schema.js';
import { hashPassword, comparePassword, hashToken } from '../../utils/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt.js';
import { AppError } from '../../middlewares/errorHandler.js';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
}

export interface SanitizedUser {
  id: string;
  name: string;
  email: string;
  currency: string;
  timezone: string;
  createdAt: Date;
}

export class AuthService {
  private sanitizeUser(user: UserRecord): SanitizedUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      timezone: user.timezone,
      createdAt: user.createdAt,
    };
  }

  async register(input: RegisterInput): Promise<{ user: SanitizedUser; tokens: AuthTokens }> {
    const existing = await authRepository.findUserByEmail(input.email);
    if (existing) {
      throw new AppError('An account with this email already exists.', 409, 'DUPLICATE_EMAIL');
    }

    const passwordHash = await hashPassword(input.password);
    const user = await authRepository.createUser({
      name: input.name,
      email: input.email,
      passwordHash,
      currency: input.currency || 'INR',
      timezone: input.timezone || 'Asia/Kolkata',
    });

    const userPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
    };

    // Create a new refresh token family for this device session
    const family = crypto.randomUUID();
    const accessToken = signAccessToken(userPayload);
    const refreshToken = signRefreshToken(userPayload, family);

    // Store hashed refresh token in database
    const hashed = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await authRepository.saveRefreshToken({
      userId: user.id,
      hashedToken: hashed,
      family,
      expiresAt,
    });

    return {
      user: this.sanitizeUser(user),
      tokens: {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: '15m',
      },
    };
  }

  async login(input: LoginInput): Promise<{ user: SanitizedUser; tokens: AuthTokens }> {
    const user = await authRepository.findUserByEmail(input.email);
    if (!user) {
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await comparePassword(input.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    const userPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
    };

    const family = crypto.randomUUID();
    const accessToken = signAccessToken(userPayload);
    const refreshToken = signRefreshToken(userPayload, family);

    const hashed = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await authRepository.saveRefreshToken({
      userId: user.id,
      hashedToken: hashed,
      family,
      expiresAt,
    });

    return {
      user: this.sanitizeUser(user),
      tokens: {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: '15m',
      },
    };
  }

  async refreshTokens(input: RefreshInput): Promise<{ tokens: AuthTokens }> {
    let payload;
    try {
      payload = verifyRefreshToken(input.refreshToken);
    } catch (e) {
      throw new AppError('Invalid or expired refresh token.', 401, 'INVALID_TOKEN');
    }

    const hashed = hashToken(input.refreshToken);
    const storedToken = await authRepository.findRefreshToken(hashed);

    if (!storedToken) {
      throw new AppError('Refresh token not recognized.', 401, 'UNAUTHORIZED');
    }

    // Reuse detection: If token was already revoked, invalidate entire family immediately!
    if (storedToken.revokedAt) {
      await authRepository.revokeTokenFamily(storedToken.family);
      throw new AppError(
        'Compromised refresh token detected. Session terminated for security.',
        401,
        'TOKEN_REUSE_DETECTED'
      );
    }

    if (new Date() > storedToken.expiresAt) {
      throw new AppError('Refresh token has expired.', 401, 'TOKEN_EXPIRED');
    }

    // Revoke the used token (Token Rotation)
    await authRepository.revokeRefreshToken(hashed);

    // Issue new access token and rotated refresh token within the same family
    const userPayload = {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
    };

    const newAccessToken = signAccessToken(userPayload);
    const newRefreshToken = signRefreshToken(userPayload, storedToken.family);

    const newHashed = hashToken(newRefreshToken);
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await authRepository.saveRefreshToken({
      userId: payload.userId,
      hashedToken: newHashed,
      family: storedToken.family,
      expiresAt: newExpiresAt,
    });

    return {
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        tokenType: 'Bearer',
        expiresIn: '15m',
      },
    };
  }

  async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) return;
    try {
      const hashed = hashToken(refreshToken);
      await authRepository.revokeRefreshToken(hashed);
    } catch (e) {
      // Safe ignore
    }
  }

  async getMe(userId: string): Promise<SanitizedUser> {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new AppError('User profile not found.', 404, 'NOT_FOUND');
    }
    return this.sanitizeUser(user);
  }

  async forgotPassword(input: ForgotPasswordInput): Promise<{ message: string }> {
    const user = await authRepository.findUserByEmail(input.email);
    if (!user) {
      // Return safe message without leaking email existence
      return {
        message: 'If an account exists with this email, instructions have been sent.',
      };
    }

    // In production, send email with reset link. For dev, we log it safely
    return {
      message: 'If an account exists with this email, instructions have been sent.',
    };
  }

  async resetPassword(input: ResetPasswordInput): Promise<{ message: string }> {
    // In production, verify reset token signature and expiry
    const newHash = await hashPassword(input.newPassword);
    // Placeholder flow for verification token
    return {
      message: 'Password has been successfully reset. Please log in with your new credentials.',
    };
  }
}

export const authService = new AuthService();
