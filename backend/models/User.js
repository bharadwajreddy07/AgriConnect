import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: function () {
                return this.authMethod === 'email';
            },
            trim: true,
        },
        email: {
            type: String,
            unique: true,
            sparse: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        password: {
            type: String,
            required: function () {
                return this.authMethod === 'email';
            },
            minlength: 6,
            select: false,
        },
        phone: {
            type: String,
            required: true,
            unique: true,
            sparse: true,
        },
        role: {
            type: String,
            enum: ['farmer', 'wholesaler', 'consumer', 'admin'],
            default: 'consumer',
            required: true,
        },
        authMethod: {
            type: String,
            enum: ['email', 'google', 'otp'],
            default: 'email',
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },
        otpVerified: {
            type: Boolean,
            default: false,
        },
        address: {
            street: String,
            village: String,
            district: String,
            state: String,
            pincode: String,
        },
        region: {
            type: String,
            required: function () {
                return this.role === 'farmer' || this.role === 'wholesaler';
            },
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        verificationDocuments: [
            {
                type: String,
            },
        ],
        profileImage: {
            type: String,
            default: '',
        },
        bankDetails: {
            accountNumber: String,
            ifscCode: String,
            accountHolderName: String,
        },
        rating: {
            average: {
                type: Number,
                default: 0,
            },
            count: {
                type: Number,
                default: 0,
            },
        },
        resetPasswordToken: {
            type: String,
        },
        resetPasswordExpires: {
            type: Date,
        },
        resetPasswordOTP: {
            type: String,
        },
        resetPasswordOTPExpires: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
