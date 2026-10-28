import { Router } from 'express';
import { aiController } from './ai.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.post('/insights', (req, res, next) => aiController.generateInsights(req, res, next));
router.post('/chat', (req, res, next) => aiController.chat(req, res, next));
router.get('/insights/history', (req, res, next) => aiController.getHistory(req, res, next));
router.patch('/insights/:id/dismiss', (req, res, next) => aiController.dismiss(req, res, next));

export default router;
