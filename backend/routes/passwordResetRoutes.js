import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// @route   POST /api/auth/forgot-password
// @desc    Generate OTP for password reset
// @access  Public
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Don't reveal if user exists or not for security
            return res.json({
                success: true,
                message: 'If that email exists, an OTP has been sent'
            });
        }

        // Generate 6-digit OTP
        const otp = generateOTP();
        user.resetPasswordOTP = otp;
        user.resetPasswordOTPExpires = Date.now() + 600000; // 10 minutes

        await user.save();

        // In production, send OTP via email/SMS
        // For now, log it to console
        console.log('\n🔐 PASSWORD RESET OTP\n');
        console.log(`To: ${user.email}`);
        console.log(`OTP: ${otp}`);
        console.log(`\nThis OTP expires in 10 minutes.\n`);

        res.json({
            success: true,
            message: 'OTP sent successfully. Please check your email.',
            // In development, include the OTP in response
            ...(process.env.NODE_ENV === 'development' && { otp }),
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP
// @access  Public
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const user = await User.findOne({
            email: email.toLowerCase(),
            resetPasswordOTP: otp,
            resetPasswordOTPExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        res.json({
            success: true,
            message: 'OTP verified successfully'
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with OTP
// @access  Public
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, password } = req.body;

        if (!email || !otp || !password) {
            return res.status(400).json({ message: 'Email, OTP, and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const user = await User.findOne({
            email: email.toLowerCase(),
            resetPasswordOTP: otp,
            resetPasswordOTPExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Set new password (will be hashed by pre-save hook)
        user.password = password;
        user.resetPasswordOTP = undefined;
        user.resetPasswordOTPExpires = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Password reset successful',
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
