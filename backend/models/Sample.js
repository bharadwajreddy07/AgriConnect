import mongoose from 'mongoose';

const sampleSchema = new mongoose.Schema(
    {
        crop: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Crop',
            required: true,
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
        requestedQuantity: {
            value: {
                type: Number,
                required: true,
                min: 0,
            },
            unit: {
                type: String,
                required: true,
                enum: ['kg', 'quintal', 'piece'],
            },
        },
        deliveryAddress: {
            street: String,
            city: String,
            state: String,
            pincode: String,
        },
        status: {
            type: String,
            enum: ['requested', 'accepted', 'rejected', 'sent', 'received', 'evaluated'],
            default: 'requested',
        },
        farmerNotes: {
            type: String,
            maxlength: 500,
        },
        wholesalerNotes: {
            type: String,
            maxlength: 500,
        },
        evaluationNotes: {
            type: String,
            maxlength: 1000,
        },
        qualityRating: {
            type: Number,
            min: 1,
            max: 5,
        },
        trackingInfo: {
            courierName: String,
            trackingNumber: String,
            estimatedDelivery: Date,
        },
        sentDate: Date,
        receivedDate: Date,
        evaluatedDate: Date,
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying
sampleSchema.index({ farmer: 1, status: 1 });
sampleSchema.index({ wholesaler: 1, status: 1 });

const Sample = mongoose.model('Sample', sampleSchema);

export default Sample;
