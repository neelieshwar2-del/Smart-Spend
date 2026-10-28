import { Router } from 'express';
import { categoryController } from './category.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

const router = Router();

// All category routes require valid user authentication
router.use(requireAuth);

router.get('/', (req, res, next) => categoryController.list(req, res, next));
router.post('/', (req, res, next) => categoryController.create(req, res, next));
router.get('/:id', (req, res, next) => categoryController.getById(req, res, next));
router.patch('/:id', (req, res, next) => categoryController.update(req, res, next));
router.delete('/:id', (req, res, next) => categoryController.delete(req, res, next));

export default router;
