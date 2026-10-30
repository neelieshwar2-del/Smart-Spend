import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/index.js';
import healthRoutes from './modules/health/health.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import categoryRoutes from './modules/categories/category.routes.js';
import transactionRoutes from './modules/transactions/transaction.routes.js';
import budgetRoutes from './modules/budgets/budget.routes.js';
import recurringRoutes from './modules/recurring/recurring.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import notificationRoutes from './modules/notifications/notification.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';
import { notFoundHandler } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';

export function createApp(): Express {
  const app = express();

  // Security Headers & Cross-Origin
  app.use(helmet());
  app.use(
    cors({
      origin: config.CORS_ORIGIN === '*' ? true : config.CORS_ORIGIN,
      credentials: true
    })
  );

  // Request Body Parsers with limits
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // HTTP Request Logger Middleware
  if (config.NODE_ENV !== 'test') {
    app.use((req, res, next) => {
      const start = Date.now();
      const reqTime = new Date().toLocaleTimeString('en-US', { hour12: false });
      console.log(`[${reqTime}] --> ${req.method} ${req.originalUrl}`);

      res.on('finish', () => {
        const duration = Date.now() - start;
        const resTime = new Date().toLocaleTimeString('en-US', { hour12: false });
        const status = res.statusCode;
        const level = status >= 500 ? 'ERROR' : status >= 400 ? 'WARN' : 'OK';
        console.log(
          `[${resTime}] <-- ${req.method} ${req.originalUrl} [${status} ${level}] (${duration}ms)`
        );
      });
      next();
    });
  }

  // Root welcome route
  app.get('/', (_req, res) => {
    res.json({
      success: true,
      message: 'SmartSpend Neo-Fintech API is running.',
      version: '1.0.0',
      documentation: `${config.API_PREFIX}/docs`,
      health: `${config.API_PREFIX}/health`
    });
  });

  // Health check endpoint
  app.use(`${config.API_PREFIX}/health`, healthRoutes);

  // Authentication & User Accounts endpoints
  app.use(`${config.API_PREFIX}/auth`, authRoutes);

  // Categories endpoints
  app.use(`${config.API_PREFIX}/categories`, categoryRoutes);

  // Transactions endpoints
  app.use(`${config.API_PREFIX}/transactions`, transactionRoutes);

  // Budgets & Dashboard endpoints
  app.use(`${config.API_PREFIX}/budgets`, budgetRoutes);

  // Recurring & Subscriptions endpoints
  app.use(`${config.API_PREFIX}/recurring`, recurringRoutes);

  // Analytics endpoints
  app.use(`${config.API_PREFIX}/analytics`, analyticsRoutes);

  // Notifications endpoints
  app.use(`${config.API_PREFIX}/notifications`, notificationRoutes);

  // AI Financial Assistant endpoints
  app.use(`${config.API_PREFIX}/ai`, aiRoutes);

  // 404 Handler
  app.use(notFoundHandler);

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
