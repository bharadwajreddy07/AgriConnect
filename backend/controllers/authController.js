import User from '../models/User.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { findLocalUserByEmail, findLocalUserById, upsertLocalUser } from '../utils/localData.js';

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    try {
        const { name, email, password, phone, role, address, region } = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json({ message: 'Please provide name, email, password, and phone number' });
        }

        // If MongoDB is connected, save to DB
        if (mongoose.connection.readyState === 1) {
            const userExists = await User.findOne({ email });
            if (userExists) {
                return res.status(400).json({ message: 'User already exists with this email' });
            }
            const phoneExists = await User.findOne({ phone });
            if (phoneExists) {
                return res.status(400).json({ message: 'User already exists with this phone number' });
            }

            const dbUser = await User.create({
                name,
                email,
                password,
                phone,
                role: role || 'consumer',
                address,
                region,
                isVerified: role === 'consumer',
            });

            // Sync to local data store
            upsertLocalUser({
                _id: dbUser._id.toString(),
                name: dbUser.name,
                email: dbUser.email,
                password,
                phone: dbUser.phone,
                role: dbUser.role,
                address: dbUser.address,
                region: dbUser.region,
                isVerified: dbUser.isVerified,
            });

            return res.status(201).json({
                _id: dbUser._id,
                name: dbUser.name,
                email: dbUser.email,
                phone: dbUser.phone,
                role: dbUser.role,
                isVerified: dbUser.isVerified,
                token: generateToken(dbUser._id),
            });
        }

        // Fallback for offline mode
        const localUser = upsertLocalUser({
            _id: new mongoose.Types.ObjectId().toString(),
            name,
            email,
            password,
            phone,
            role: role || 'consumer',
            address,
            region,
            isVerified: role === 'consumer',
        });

        res.status(201).json({
            _id: localUser._id,
            name: localUser.name,
            email: localUser.email,
            phone: localUser.phone,
            role: localUser.role,
            isVerified: localUser.isVerified,
            token: generateToken(localUser._id),
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            message: 'Registration failed. Please try again later.',
            error: error.message,
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`Login attempt for email: ${email}`);

        const localUser = findLocalUserByEmail(email);

        if (localUser) {
            if (localUser.password !== password) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            return res.json({
                _id: localUser._id,
                name: localUser.name,
                email: localUser.email,
                phone: localUser.phone,
                role: localUser.role,
                isVerified: localUser.isVerified,
                token: generateToken(localUser._id),
            });
        }

        // If offline and not in local data, don't attempt Mongo query to avoid timeout
        if (mongoose.connection.readyState !== 1) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            console.log('User not found');
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Password does not match');
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        console.log('Login successful');
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isVerified: user.isVerified,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
    try {
        const localUser = findLocalUserById(req.user._id);

        if (localUser) {
            return res.json({
                _id: localUser._id,
                name: localUser.name,
                email: localUser.email,
                phone: localUser.phone,
                role: localUser.role,
                address: localUser.address,
                region: localUser.region,
                isVerified: localUser.isVerified,
                profileImage: '',
                bankDetails: {},
                rating: { average: 0, count: 0 },
                createdAt: new Date().toISOString(),
            });
        }

        if (mongoose.connection.readyState !== 1) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                address: user.address,
                region: user.region,
                isVerified: user.isVerified,
                profileImage: user.profileImage,
                bankDetails: user.bankDetails,
                rating: user.rating,
                createdAt: user.createdAt,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const localUser = findLocalUserById(req.user._id);

        if (localUser) {
            localUser.name = req.body.name || localUser.name;
            localUser.phone = req.body.phone || localUser.phone;
            localUser.address = req.body.address || localUser.address;
            localUser.region = req.body.region || localUser.region;
            localUser.bankDetails = req.body.bankDetails || localUser.bankDetails;

            return res.json({
                _id: localUser._id,
                name: localUser.name,
                email: localUser.email,
                phone: localUser.phone,
                role: localUser.role,
                address: localUser.address,
                region: localUser.region,
                isVerified: localUser.isVerified,
                profileImage: '',
                bankDetails: localUser.bankDetails || {},
            });
        }

        if (mongoose.connection.readyState !== 1) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.phone = req.body.phone || user.phone;
            user.address = req.body.address || user.address;
            user.region = req.body.region || user.region;
            user.bankDetails = req.body.bankDetails || user.bankDetails;

            if (req.file) {
                user.profileImage = req.file.path;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                role: updatedUser.role,
                address: updatedUser.address,
                region: updatedUser.region,
                isVerified: updatedUser.isVerified,
                profileImage: updatedUser.profileImage,
                bankDetails: updatedUser.bankDetails,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Forgot password - Send reset token
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (mongoose.connection.readyState !== 1) {
            const localUser = findLocalUserByEmail(email);
            if (!localUser) {
                return res.status(404).json({ message: 'User not found with this email' });
            }
            return res.json({
                success: true,
                message: 'Password reset link sent to your email (Offline Mock Mode)',
                resetToken: 'mock-offline-token-' + Date.now(),
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found with this email' });
        }

        // Generate reset token using JWT
        const resetToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Save hashed token to database
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // In a real application, you would send this via email
        // For now, we'll return it in the response for testing
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

        console.log('Password reset URL:', resetUrl);

        res.json({
            success: true,
            message: 'Password reset link sent to your email',
            resetToken, // Remove this in production
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Verify reset token
// @route   GET /api/auth/verify-reset-token/:token
// @access  Public
export const verifyResetToken = async (req, res) => {
    try {
        const { token } = req.params;

        if (mongoose.connection.readyState !== 1) {
            return res.json({ success: true, message: 'Token is valid (Offline Mock Mode)' });
        }

        // Verify JWT token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Hash the token to compare with database
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with this token and check expiry
        const user = await User.findOne({
            _id: decoded.userId,
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        res.json({ success: true, message: 'Token is valid' });
    } catch (error) {
        console.error('Verify token error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        if (mongoose.connection.readyState !== 1) {
            return res.json({
                success: true,
                message: 'Password reset successfully (Offline Mock Mode)',
            });
        }

        // Verify JWT token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Hash the token to compare with database
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with this token and check expiry
        const user = await User.findOne({
            _id: decoded.userId,
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        }).select('+password');

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Update password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Password reset successfully',
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// @desc    Reset password directly with email and new password
// @route   POST /api/auth/reset-password-direct
// @access  Public
export const resetPasswordDirect = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({ message: 'Email and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        if (mongoose.connection.readyState !== 1) {
            const localUser = findLocalUserByEmail(email);
            if (!localUser) {
                return res.status(404).json({ message: 'User not found with this email' });
            }
            localUser.password = newPassword;
            return res.json({
                success: true,
                message: 'Password updated successfully (Offline Mock Mode)',
            });
        }

        // Find user by email
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(404).json({ message: 'User not found with this email' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password updated successfully',
        });
    } catch (error) {
        console.error('Direct reset password error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};