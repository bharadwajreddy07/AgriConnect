import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

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

        // Check if user already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            phone,
            role: role || 'consumer',
            address,
            region,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isVerified: user.isVerified,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.comparePassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isVerified: user.isVerified,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
    try {
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
/ /   @ d e s c         R e s e t   p a s s w o r d   d i r e c t l y   w i t h   e m a i l   a n d   n e w   p a s s w o r d  
 / /   @ r o u t e       P O S T   / a p i / a u t h / r e s e t - p a s s w o r d - d i r e c t  
 / /   @ a c c e s s     P u b l i c  
 e x p o r t   c o n s t   r e s e t P a s s w o r d D i r e c t   =   a s y n c   ( r e q ,   r e s )   = >   {  
         t r y   {  
                 c o n s t   {   e m a i l ,   n e w P a s s w o r d   }   =   r e q . b o d y ;  
  
                 i f   ( ! e m a i l   | |   ! n e w P a s s w o r d )   {  
                         r e t u r n   r e s . s t a t u s ( 4 0 0 ) . j s o n ( {   m e s s a g e :   ' E m a i l   a n d   n e w   p a s s w o r d   a r e   r e q u i r e d '   } ) ;  
                 }  
  
                 i f   ( n e w P a s s w o r d . l e n g t h   <   6 )   {  
                         r e t u r n   r e s . s t a t u s ( 4 0 0 ) . j s o n ( {   m e s s a g e :   ' P a s s w o r d   m u s t   b e   a t   l e a s t   6   c h a r a c t e r s '   } ) ;  
                 }  
  
                 / /   F i n d   u s e r   b y   e m a i l  
                 c o n s t   u s e r   =   a w a i t   U s e r . f i n d O n e ( {   e m a i l   } ) . s e l e c t ( ' + p a s s w o r d ' ) ;  
  
                 i f   ( ! u s e r )   {  
                         r e t u r n   r e s . s t a t u s ( 4 0 4 ) . j s o n ( {   m e s s a g e :   ' U s e r   n o t   f o u n d   w i t h   t h i s   e m a i l '   } ) ;  
                 }  
  
                 / /   U p d a t e   p a s s w o r d  
                 u s e r . p a s s w o r d   =   n e w P a s s w o r d ;  
                 a w a i t   u s e r . s a v e ( ) ;  
  
                 r e s . j s o n ( {  
                         s u c c e s s :   t r u e ,  
                         m e s s a g e :   ' P a s s w o r d   u p d a t e d   s u c c e s s f u l l y ' ,  
                 } ) ;  
         }   c a t c h   ( e r r o r )   {  
                 c o n s o l e . e r r o r ( ' D i r e c t   r e s e t   p a s s w o r d   e r r o r : ' ,   e r r o r ) ;  
                 r e s . s t a t u s ( 5 0 0 ) . j s o n ( {   m e s s a g e :   ' S e r v e r   e r r o r ' ,   e r r o r :   e r r o r . m e s s a g e   } ) ;  
         }  
 } ;  
 