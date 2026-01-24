import express from 'express';
import {
    createCrop,
    getCrops,
    getMyCrops,
    getCropById,
    updateCrop,
    updateCropStock,
    toggleConsumerAvailability,
    bulkDeleteCrops,
    deleteCrop,
    getFarmerCrops,
    approveCrop,
} from '../controllers/cropController.js';
import { protect, authorize, checkVerified } from '../middleware/authMiddleware.js';
import { uploadCropMedia } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getCrops);

// Protected routes - Farmer only (specific routes before parameterized routes)
router.get('/my-crops', protect, authorize('farmer'), getMyCrops);
router.post('/bulk-delete', protect, authorize('farmer'), bulkDeleteCrops);

router.post(
    '/',
    protect,
    authorize('farmer'),
    checkVerified,
    uploadCropMedia,
    createCrop
);

// Parameterized routes (must come after specific routes)
router.get('/:id', getCropById);
router.get('/farmer/:farmerId', getFarmerCrops);

router.put(
    '/:id',
    protect,
    authorize('farmer'),
    checkVerified,
    uploadCropMedia,
    updateCrop
);
router.put('/:id/stock', protect, authorize('farmer'), updateCropStock);
router.put('/:id/toggle-consumer', protect, authorize('farmer'), toggleConsumerAvailability);
router.put('/:id/approve', protect, authorize('admin'), approveCrop);
router.delete('/:id', protect, authorize('farmer'), deleteCrop);

export default router;

