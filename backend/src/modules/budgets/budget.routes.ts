import { Router } from 'express';
import { budgetController } from './budget.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

const router = Router();

// All budget endpoints require authenticated user
router.use(requireAuth);

router.get('/', (req, res, next) => budgetController.list(req, res, next));
router.post('/', (req, res, next) => budgetController.create(req, res, next));
router.get('/summary', (req, res, next) => budgetController.getSummary(req, res, next));
router.get('/dashboard', (req, res, next) => budgetController.getDashboard(req, res, next));
router.get('/:id', (req, res, next) => budgetController.getById(req, res, next));
router.patch('/:id', (req, res, next) => budgetController.update(req, res, next));
router.delete('/:id', (req, res, next) => budgetController.delete(req, res, next));

export default router;
