import express from 'express';
import {
    requestSample,
    getFarmerSamples,
    getWholesalerSamples,
    updateSampleStatus,
    evaluateSample,
} from '../controllers/sampleController.js';
import { protect, authorize, checkVerified } from '../middleware/authMiddleware.js';

const router = express.Router();

// Wholesaler routes
router.post(
    '/request',
    protect,
    authorize('wholesaler'),
    checkVerified,
    requestSample
);
router.get(
    '/wholesaler',
    protect,
    authorize('wholesaler'),
    getWholesalerSamples
);
router.post('/:id/evaluate', protect, authorize('wholesaler'), evaluateSample);

// Farmer routes
router.get('/farmer', protect, authorize('farmer'), getFarmerSamples);

// Both farmer and wholesaler
router.put(
    '/:id/status',
    protect,
    authorize('farmer', 'wholesaler'),
    updateSampleStatus
);

export default router;
