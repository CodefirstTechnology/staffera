import { Router } from 'express';
import { getCategories, createCategory, getServicesByCategory, createService, getServiceDetails } from '../controllers/serviceController';
import { authenticate, restrictTo } from '../middleware/auth';

const router = Router();

// Public routes (anyone authenticated can view)
router.get('/categories', getCategories);
router.get('/categories/:categoryId/services', getServicesByCategory);
router.get('/services/:id', getServiceDetails);

// Admin restricted operations
router.post('/categories', authenticate, restrictTo('ADMIN'), createCategory);
router.post('/services', authenticate, restrictTo('ADMIN'), createService);

export default router;
