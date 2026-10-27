import { Router } from 'express';
import { analyticsController } from './analytics.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/overview', (req, res, next) => analyticsController.getOverview(req, res, next));
router.get('/daily', (req, res, next) => analyticsController.getDaily(req, res, next));
router.get('/monthly', (req, res, next) => analyticsController.getMonthly(req, res, next));
router.get('/categories', (req, res, next) => analyticsController.getCategories(req, res, next));
router.get('/trends', (req, res, next) => analyticsController.getTrends(req, res, next));
router.get('/cash-flow', (req, res, next) => analyticsController.getCashFlow(req, res, next));

export default router;
