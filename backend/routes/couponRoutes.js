import express from 'express';
import {
    createCoupon,
    getAllCoupons,
    updateCoupon,
    deleteCoupon,
    validateCoupon,
} from '../controllers/couponController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route for validation
router.post('/validate', protect, validateCoupon);

// Admin routes
router.post('/', protect, authorize('admin'), createCoupon);
router.get('/', protect, authorize('admin'), getAllCoupons);
router.put('/:id', protect, authorize('admin'), updateCoupon);
router.delete('/:id', protect, authorize('admin'), deleteCoupon);

export default router;
