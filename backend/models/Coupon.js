import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        discountType: {
            type: String,
            enum: ['percentage', 'fixed'],
            required: true,
        },
        discountValue: {
            type: Number,
            required: true,
            min: 0,
        },
        minOrderAmount: {
            type: Number,
            default: 0,
        },
        maxDiscountAmount: {
            type: Number, // For percentage discounts
        },
        validFrom: {
            type: Date,
            required: true,
        },
        validUntil: {
            type: Date,
            required: true,
        },
        usageLimit: {
            type: Number,
            default: null, // null = unlimited
        },
        usedCount: {
            type: Number,
            default: 0,
        },
        applicableProducts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Crop',
            },
        ],
        applicableCategories: [
            {
                type: String,
            },
        ],
        isActive: {
            type: Boolean,
            default: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Method to check if coupon is valid
couponSchema.methods.isValid = function () {
    const now = new Date();
    return (
        this.isActive &&
        now >= this.validFrom &&
        now <= this.validUntil &&
        (this.usageLimit === null || this.usedCount < this.usageLimit)
    );
};

// Method to calculate discount
couponSchema.methods.calculateDiscount = function (orderAmount) {
    if (!this.isValid()) {
        return 0;
    }

    if (orderAmount < this.minOrderAmount) {
        return 0;
    }

    let discount = 0;
    if (this.discountType === 'percentage') {
        discount = (orderAmount * this.discountValue) / 100;
        if (this.maxDiscountAmount && discount > this.maxDiscountAmount) {
            discount = this.maxDiscountAmount;
        }
    } else {
        discount = this.discountValue;
    }

    return Math.min(discount, orderAmount);
};

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
