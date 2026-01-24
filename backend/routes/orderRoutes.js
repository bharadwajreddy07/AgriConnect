import express from 'express';
import {
    placeOrder,
    getUserOrders,
    getOrderById,
    updateOrderStatus,
    updateTracking,
    updatePaymentStatus,
    addRating,
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Place order (Wholesaler or Consumer)
router.post('/', protect, authorize('wholesaler', 'consumer'), placeOrder);

// Get user's orders
router.get('/', protect, getUserOrders);

// Get single order
router.get('/:id', protect, getOrderById);

// Update order status (Seller or Admin)
router.put(
    '/:id/status',
    protect,
    authorize('farmer', 'admin'),
    updateOrderStatus
);

// Update tracking (Seller or Admin)
router.put(
    '/:id/tracking',
    protect,
    authorize('farmer', 'admin'),
    updateTracking
);

// Update payment status (Admin only)
router.put('/:id/payment', protect, authorize('admin'), updatePaymentStatus);

// Add rating (Buyer only)
router.put('/:id/rating', protect, authorize('wholesaler', 'consumer'), addRating);

export default router;
