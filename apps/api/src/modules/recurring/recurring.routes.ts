import { Router } from 'express';
import { recurringController } from './recurring.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.post('/process', (req, res, next) => recurringController.processDue(req, res, next));
router.post('/', (req, res, next) => recurringController.create(req, res, next));
router.get('/', (req, res, next) => recurringController.list(req, res, next));
router.get('/:id', (req, res, next) => recurringController.getById(req, res, next));
router.patch('/:id', (req, res, next) => recurringController.update(req, res, next));
router.delete('/:id', (req, res, next) => recurringController.delete(req, res, next));

export default router;
