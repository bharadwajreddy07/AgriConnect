import mongoose from 'mongoose';

const wholesaleOrderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            unique: true,
        },
        wholesaler: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        farmer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        crop: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Crop',
            required: true,
        },
        negotiation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Negotiation',
        },
        quantity: {
            value: {
                type: Number,
                required: true,
            },
            unit: {
                type: String,
                required: true,
                enum: ['kg', 'quintal', 'ton', 'piece'],
            },
        },
        pricePerUnit: {
            type: Number,
            required: true,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        deliveryAddress: {
            name: {
                type: String,
                required: true,
            },
            phone: {
                type: String,
                required: true,
            },
            street: {
                type: String,
                required: true,
            },
            city: {
                type: String,
                required: true,
            },
            state: {
                type: String,
                required: true,
            },
            pincode: {
                type: String,
                required: true,
            },
            landmark: String,
        },
        deliveryTerms: {
            type: String,
            default: 'Standard Delivery',
        },
        paymentTerms: {
            type: String,
            default: 'Payment on Delivery',
        },
        paymentMethod: {
            type: String,
            enum: ['cod', 'online', 'bank_transfer', 'credit'],
            default: 'cod',
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'partial', 'paid', 'refunded'],
            default: 'pending',
        },
        status: {
            type: String,
            enum: [
                'pending',
                'confirmed',
                'processing',
                'packed',
                'shipped',
                'in_transit',
                'delivered',
                'cancelled',
                'returned',
            ],
            default: 'pending',
        },
        statusHistory: [
            {
                status: String,
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
                note: String,
            },
        ],
        expectedDeliveryDate: Date,
        actualDeliveryDate: Date,
        notes: String,
        cancellationReason: String,
    },
    {
        timestamps: true,
    }
);

// Generate order number before saving
wholesaleOrderSchema.pre('save', async function (next) {
    if (!this.orderNumber) {
        const count = await mongoose.model('WholesaleOrder').countDocuments();
        this.orderNumber = `WO${Date.now()}${count + 1}`;
    }
    next();
});

// Add initial status to history
wholesaleOrderSchema.pre('save', function (next) {
    if (this.isNew) {
        this.statusHistory.push({
            status: this.status,
            timestamp: new Date(),
            note: 'Order placed',
        });
    }
    next();
});

// Virtual field for pricing (for frontend compatibility)
wholesaleOrderSchema.virtual('pricing').get(function () {
    return {
        pricePerUnit: this.pricePerUnit,
        totalAmount: this.totalAmount,
    };
});

// Ensure virtuals are included in JSON
wholesaleOrderSchema.set('toJSON', { virtuals: true });
wholesaleOrderSchema.set('toObject', { virtuals: true });

const WholesaleOrder = mongoose.model('WholesaleOrder', wholesaleOrderSchema);

export default WholesaleOrder;
