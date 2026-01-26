import mongoose from 'mongoose';

const cropSchema = new mongoose.Schema(
    {
        farmer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        name: {
            type: String,
            required: [true, 'Please provide crop name'],
            trim: true,
        },
        category: {
            type: String,
            required: [true, 'Please provide crop category'],
            enum: [
                'Cereals',
                'Pulses',
                'Oilseeds',
                'Vegetables',
                'Fruits',
                'Spices',
                'Cash Crops',
                'Fiber Crops',
            ],
        },
        season: {
            type: String,
            required: [true, 'Please provide season'],
            enum: ['Kharif', 'Rabi', 'Zaid', 'Year-Round'],
        },
        quantity: {
            value: {
                type: Number,
                required: [true, 'Please provide quantity'],
                min: 0,
            },
            unit: {
                type: String,
                required: true,
                enum: ['kg', 'quintal', 'ton', 'piece'],
            },
        },
        expectedPrice: {
            type: Number,
            required: [true, 'Please provide expected price'],
            min: 0,
        },
        priceUnit: {
            type: String,
            default: 'per quintal',
        },
        isNegotiable: {
            type: Boolean,
            default: true,
        },
        location: {
            region: {
                type: String,
                // required: true, // Temporarily disabled for seeding
            },
            state: {
                type: String,
                required: true,
            },
            district: {
                type: String,
                required: true,
            },
            village: String,
        },
        images: [
            {
                type: String,
            },
        ],
        videos: [
            {
                type: String,
            },
        ],
        description: {
            type: String,
            maxlength: 1000,
        },
        qualityGrade: {
            type: String,
            enum: ['Premium', 'Grade A', 'Grade B', 'Standard'],
            default: 'Standard',
        },
        organicCertified: {
            type: Boolean,
            default: false,
        },
        harvestDate: {
            type: Date,
        },
        availableFrom: {
            type: Date,
            default: Date.now,
        },
        availableUntil: {
            type: Date,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'active', 'sold', 'expired', 'rejected'],
            default: 'pending',
        },
        views: {
            type: Number,
            default: 0,
        },
        sampleRequests: {
            type: Number,
            default: 0,
        },
        // Consumer Marketplace Fields
        availableForConsumers: {
            type: Boolean,
            default: false,
        },
        consumerPrice: {
            type: Number,
            min: 0,
        },
        stockQuantity: {
            type: Number,
            default: 0,
            min: 0,
        },
        minOrderQuantity: {
            value: {
                type: Number,
                default: 1,
            },
            unit: {
                type: String,
                default: 'kg',
            },
        },
        deliveryOptions: {
            homeDelivery: {
                type: Boolean,
                default: false,
            },
            pickupAvailable: {
                type: Boolean,
                default: true,
            },
            deliveryCharge: {
                type: Number,
                default: 0,
            },
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient searching
cropSchema.index({ season: 1, 'location.state': 1, status: 1 });
cropSchema.index({ farmer: 1 });

const Crop = mongoose.model('Crop', cropSchema);

export default Crop;
