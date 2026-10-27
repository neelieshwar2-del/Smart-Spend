import { Router } from 'express';
import { transactionController } from './transaction.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

const router = Router();

// All transaction endpoints require verified authentication
router.use(requireAuth);

router.get('/', (req, res, next) => transactionController.list(req, res, next));
router.post('/', (req, res, next) => transactionController.create(req, res, next));
router.get('/:id', (req, res, next) => transactionController.getById(req, res, next));
router.patch('/:id', (req, res, next) => transactionController.update(req, res, next));
router.delete('/:id', (req, res, next) => transactionController.delete(req, res, next));

export default router;
