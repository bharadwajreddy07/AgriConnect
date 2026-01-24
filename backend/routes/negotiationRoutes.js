import express from 'express';
import {
    startNegotiation,
    getNegotiation,
    makeOffer,
    acceptOffer,
    rejectOffer,
    getUserNegotiations,
} from '../controllers/negotiationController.js';
import { protect, authorize, checkVerified } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get user's negotiations
router.get('/', protect, authorize('farmer', 'wholesaler'), getUserNegotiations);

// Start negotiation (Wholesaler only)
router.post(
    '/',
    protect,
    authorize('wholesaler'),
    checkVerified,
    startNegotiation
);

// Get single negotiation
router.get('/:id', protect, authorize('farmer', 'wholesaler'), getNegotiation);

// Make offer
router.post(
    '/:id/offer',
    protect,
    authorize('farmer', 'wholesaler'),
    makeOffer
);

// Accept offer
router.put(
    '/:id/accept',
    protect,
    authorize('farmer', 'wholesaler'),
    acceptOffer
);

// Reject offer
router.put(
    '/:id/reject',
    protect,
    authorize('farmer', 'wholesaler'),
    rejectOffer
);

export default router;
