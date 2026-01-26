import express from 'express';
import {
    getAllUsers,
    verifyUser,
    getPendingCrops,
    getAnalytics,
    getSeasonalReport,
    getPriceTrends,
    getRecentNegotiations,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are admin only
router.use(protect);
router.use(authorize('admin'));

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/verify', verifyUser);

// Crop management
router.get('/crops/pending', getPendingCrops);

// Analytics
router.get('/analytics', getAnalytics);

// Reports
router.get('/reports/seasonal', getSeasonalReport);
router.get('/reports/price-trends', getPriceTrends);

// Negotiation management
router.get('/negotiations/recent', getRecentNegotiations);

export default router;
