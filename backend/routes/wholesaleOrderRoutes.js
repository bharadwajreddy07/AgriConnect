import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    createOrder,
    createOrderFromNegotiation,
    getOrders,
    getOrder,
    updateOrderStatus,
    cancelOrder,
} from '../controllers/wholesaleOrderController.js';

const router = express.Router();

// Create order routes
router.post('/', protect, createOrder);
router.post('/from-negotiation/:negotiationId', protect, createOrderFromNegotiation);

// Get orders
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrder);

// Update order
router.put('/:id/status', protect, updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);

export default router;
