import mongoose from 'mongoose';

const negotiationSchema = new mongoose.Schema(
    {
        crop: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Crop',
            required: true,
        },
        sample: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Sample',
        },
        farmer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        wholesaler: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        initialPrice: {
            type: Number,
            required: true,
        },
        offerHistory: [
            {
                offeredBy: {
                    type: String,
                    enum: ['farmer', 'wholesaler'],
                    required: true,
                },
                amount: {
                    type: Number,
                    required: true,
                },
                quantity: {
                    value: Number,
                    unit: String,
                },
                message: String,
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        currentOffer: {
            amount: Number,
            offeredBy: String,
        },
        status: {
            type: String,
            enum: ['ongoing', 'accepted', 'rejected', 'expired', 'cancelled'],
            default: 'ongoing',
        },
        finalAgreedPrice: {
            type: Number,
        },
        agreedQuantity: {
            value: Number,
            unit: String,
        },
        totalAmount: {
            type: Number,
        },
        acceptedBy: {
            type: String,
            enum: ['farmer', 'wholesaler'],
        },
        acceptedAt: Date,
        farmerAccepted: {
            type: Boolean,
            default: false,
        },
        wholesalerAccepted: {
            type: Boolean,
            default: false,
        },
        createdOrder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'WholesaleOrder',
        },
        expiresAt: {
            type: Date,
            default: function () {
                return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
            },
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying
negotiationSchema.index({ farmer: 1, status: 1 });
negotiationSchema.index({ wholesaler: 1, status: 1 });
negotiationSchema.index({ crop: 1 });

const Negotiation = mongoose.model('Negotiation', negotiationSchema);

export default Negotiation;
