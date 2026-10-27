import { Router } from 'express';
import { notificationController } from './notification.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/unread-count', (req, res, next) => notificationController.getUnreadCount(req, res, next));
router.post('/read-all', (req, res, next) => notificationController.markAllRead(req, res, next));
router.get('/', (req, res, next) => notificationController.list(req, res, next));
router.patch('/:id/read', (req, res, next) => notificationController.markRead(req, res, next));

export default router;
