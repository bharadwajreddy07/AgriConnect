import express from 'express';
import {
    getMarketplaceCrops,
    getMarketplaceCrop,
    placeConsumerOrder,
    getConsumerOrders,
    trackOrder,
    updateOrderStatus,
    getFarmerConsumerOrders,
    updateConsumerOrderStatus,
    addTrackingInfo,
    cancelConsumerOrder,
} from '../controllers/marketplaceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/crops', getMarketplaceCrops);
router.get('/crops/:id', getMarketplaceCrop);

// Consumer routes
router.post('/orders', protect, placeConsumerOrder);
router.get('/orders', protect, getConsumerOrders);
router.get('/orders/:id', protect, trackOrder);
router.get('/orders/:id/track', protect, trackOrder);
router.put('/orders/:id/cancel', protect, cancelConsumerOrder);

// Farmer routes for consumer orders
router.get('/farmer/orders', protect, authorize('farmer'), getFarmerConsumerOrders);
router.put('/farmer/orders/:id/status', protect, authorize('farmer'), updateConsumerOrderStatus);
router.put('/farmer/orders/:id/tracking', protect, authorize('farmer'), addTrackingInfo);

// Admin/Farmer routes
router.put('/orders/:id/status', protect, authorize('farmer', 'admin'), updateOrderStatus);

export default router;
