import express from 'express';
import {
    register,
    login,
    getProfile,
    updateProfile,
    forgotPassword,
    verifyResetToken,
    resetPassword,
    resetPasswordDirect,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadProfileImage } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/verify-reset-token/:token', verifyResetToken);
router.post('/reset-password', resetPassword);
router.post('/reset-password-direct', resetPasswordDirect);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, uploadProfileImage, updateProfile);

export default router;
