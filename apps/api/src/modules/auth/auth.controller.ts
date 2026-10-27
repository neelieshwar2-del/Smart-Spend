import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.schema.js';
import { ApiResponse } from '../../types/index.js';
import { AppError } from '../../middlewares/errorHandler.js';

export class AuthController {
  async register(req: Request, res: Response<ApiResponse<any>>, next: NextFunction): Promise<void> {
    try {
      const validated = registerSchema.parse(req.body);
      const result = await authService.register(validated);

      res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response<ApiResponse<any>>, next: NextFunction): Promise<void> {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await authService.login(validated);

      res.status(200).json({
        success: true,
        message: 'Logged in successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response<ApiResponse<any>>, next: NextFunction): Promise<void> {
    try {
      const validated = refreshSchema.parse(req.body);
      const result = await authService.refreshTokens(validated);

      res.status(200).json({
        success: true,
        message: 'Tokens refreshed successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response<ApiResponse<any>>, next: NextFunction): Promise<void> {
    try {
      await authService.logout(req.body.refreshToken);

      res.status(200).json({
        success: true,
        message: 'Logged out successfully.',
        data: { loggedOut: true },
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response<ApiResponse<any>>, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new AppError('Unauthorized access.', 401, 'UNAUTHORIZED');
      }

      const profile = await authService.getMe(req.user.userId);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response<ApiResponse<any>>, next: NextFunction): Promise<void> {
    try {
      const validated = forgotPasswordSchema.parse(req.body);
      const result = await authService.forgotPassword(validated);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response<ApiResponse<any>>, next: NextFunction): Promise<void> {
    try {
      const validated = resetPasswordSchema.parse(req.body);
      const result = await authService.resetPassword(validated);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
