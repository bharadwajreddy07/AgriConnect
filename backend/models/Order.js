import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            unique: true,
            required: true,
        },
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        buyerType: {
            type: String,
            enum: ['wholesaler', 'consumer'],
            required: true,
        },
        // For single-item orders (wholesaler)
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        crop: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Crop',
        },
        negotiation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Negotiation',
        },
        quantity: {
            value: {
                type: Number,
                min: 0,
            },
            unit: {
                type: String,
            },
        },
        pricePerUnit: {
            type: Number,
            min: 0,
        },
        // For multi-item orders (consumer marketplace)
        items: [
            {
                crop: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Crop',
                },
                farmer: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                quantity: {
                    type: Number,
                    required: true,
                },
                price: {
                    type: Number,
                    required: true,
                },
                total: {
                    type: Number,
                    required: true,
                },
            },
        ],
        orderType: {
            type: String,
            enum: ['wholesaler', 'consumer'],
            default: 'wholesaler',
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        deliveryAddress: {
            name: String,
            phone: String,
            street: String,
            city: String,
            state: String,
            pincode: String,
        },
        orderStatus: {
            type: String,
            enum: [
                'placed',
                'confirmed',
                'processing',
                'packed',
                'shipped',
                'out_for_delivery',
                'delivered',
                'cancelled',
                'returned',
            ],
            default: 'placed',
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'pending',
        },
        paymentMethod: {
            type: String,
            enum: ['cod', 'online', 'bank_transfer'],
            default: 'cod',
        },
        trackingInfo: {
            courierName: String,
            trackingNumber: String,
            currentLocation: String,
            estimatedDelivery: Date,
        },
        statusHistory: [
            {
                status: String,
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
                notes: String,
            },
        ],
        confirmedAt: Date,
        shippedAt: Date,
        deliveredAt: Date,
        cancelledAt: Date,
        cancellationReason: String,
        rating: {
            value: {
                type: Number,
                min: 1,
                max: 5,
            },
            review: String,
            timestamp: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Generate order number before saving
orderSchema.pre('save', async function (next) {
    if (!this.orderNumber) {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 7);
        this.orderNumber = `ORD-${timestamp}-${random}`.toUpperCase();
    }
    next();
});

// Index for efficient querying
orderSchema.index({ buyer: 1, orderStatus: 1 });
orderSchema.index({ seller: 1, orderStatus: 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
