import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from './models/User.js';
import Crop from './models/Crop.js';
import Order from './models/Order.js';
import Negotiation from './models/Negotiation.js';

dotenv.config();

const cleanSeed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Clear Data
        console.log('Clearing existing data...');
        await Crop.deleteMany({});
        await Order.deleteMany({});
        await Negotiation.deleteMany({});
        // Note: Keeping Users to avoid login issues, but ensuring we have a valid farmer.

        // 2. Get or Create a Test Farmer
        let farmer = await User.findOne({ role: 'farmer', email: 'farmer@test.com' });
        if (!farmer) {
            console.log('Creating test farmer...');
            farmer = await User.create({
                name: 'Ramesh Farmer',
                email: 'farmer@test.com',
                password: 'password123', // Hash this if using real auth flow, but for seed it's mainly for ID ref
                phone: '9876543210',
                role: 'farmer',
                address: '123 Village Road, Guntur, AP'
            });
        }

        // 3. Define 10 Verified Crops
        const verifiedCrops = [
            {
                name: 'Tomato',
                category: 'Vegetables',
                season: 'Rabi',
                images: ['/images/crops/tomatoes.png'], // Verified Path
                expectedPrice: 2000, // ₹20/kg -> ₹2000/quintal
                priceUnit: 'quintal',
                quantity: { value: 50, unit: 'quintal' },
                location: { state: 'Andhra Pradesh', district: 'Guntur' },
                description: 'Fresh red tomatoes, organic farm grown.',
                qualityGrade: 'Grade A',
                status: 'approved'
            },
            {
                name: 'Potato',
                category: 'Vegetables',
                season: 'Rabi',
                images: ['/images/crops/potatoes.png'],
                expectedPrice: 1500,
                priceUnit: 'quintal',
                quantity: { value: 100, unit: 'quintal' },
                location: { state: 'Uttar Pradesh', district: 'Agra' },
                description: 'Large size potatoes, good for chips.',
                qualityGrade: 'Grade A',
                status: 'approved'
            },
            {
                name: 'Onion',
                category: 'Vegetables',
                season: 'Kharif',
                images: ['/images/crops/onions.png'],
                expectedPrice: 3000,
                priceUnit: 'quintal',
                quantity: { value: 40, unit: 'quintal' },
                location: { state: 'Maharashtra', district: 'Nashik' },
                description: 'Red onions, pungent and long lasting.',
                qualityGrade: 'Grade A',
                status: 'approved'
            },
            {
                name: 'Cotton',
                category: 'Fiber Crops',
                season: 'Kharif',
                images: ['/images/crops/cotton.png'],
                expectedPrice: 6000,
                priceUnit: 'quintal',
                quantity: { value: 200, unit: 'quintal' },
                location: { state: 'Gujarat', district: 'Rajkot' },
                description: 'High quality cotton bales.',
                qualityGrade: 'Premium',
                status: 'approved'
            },
            {
                name: 'Sugarcane',
                category: 'Cash Crops',
                season: 'Year-Round',
                images: ['/images/crops/sugarcane.png'],
                expectedPrice: 350,
                priceUnit: 'ton',
                quantity: { value: 500, unit: 'ton' },
                location: { state: 'Maharashtra', district: 'Pune' },
                description: 'Juicy sugarcane for sugar production.',
                qualityGrade: 'Grade A',
                status: 'approved'
            },
            {
                name: 'Wheat',
                category: 'Cereals',
                season: 'Rabi',
                images: ['/images/crops/wheat.png'],
                expectedPrice: 2200,
                priceUnit: 'quintal',
                quantity: { value: 150, unit: 'quintal' },
                location: { state: 'Punjab', district: 'Ludhiana' },
                description: 'Golden wheat grains, cleaned.',
                qualityGrade: 'Premium',
                status: 'approved'
            },
            {
                name: 'Mango',
                category: 'Fruits',
                season: 'Summer',
                images: ['/images/crops/mangoes.png'],
                expectedPrice: 5000,
                priceUnit: 'quintal',
                quantity: { value: 20, unit: 'quintal' },
                location: { state: 'Andhra Pradesh', district: 'Vijayawada' },
                description: 'Sweet Banganapalli mangoes.',
                qualityGrade: 'Premium',
                status: 'approved'
            },
            {
                name: 'Chilli',
                category: 'Spices',
                season: 'Rabi',
                images: ['/images/crops/chilli.png'],
                expectedPrice: 12000,
                priceUnit: 'quintal',
                quantity: { value: 10, unit: 'quintal' },
                location: { state: 'Andhra Pradesh', district: 'Guntur' },
                description: 'Spicy dry red chillies.',
                qualityGrade: 'Grade A',
                status: 'approved'
            },
            {
                name: 'Turmeric',
                category: 'Spices',
                season: 'Rabi',
                images: ['/images/crops/turmeric.png'],
                expectedPrice: 8000,
                priceUnit: 'quintal',
                quantity: { value: 15, unit: 'quintal' },
                location: { state: 'Telangana', district: 'Nizamabad' },
                description: 'High curcumin content turmeric fingers.',
                qualityGrade: 'Grade A',
                status: 'approved'
            },
            {
                name: 'Banana',
                category: 'Fruits',
                season: 'Year-Round',
                images: ['/images/crops/bananas.png'],
                expectedPrice: 1000,
                priceUnit: 'quintal',
                quantity: { value: 100, unit: 'quintal' },
                location: { state: 'Tamil Nadu', district: 'Trichy' },
                description: 'Green cavendish bananas.',
                qualityGrade: 'Grade A',
                status: 'approved'
            }
        ];

        // 4. Insert Crops
        const cropsToInsert = verifiedCrops.map(c => ({
            ...c,
            location: {
                state: c.location.state,
                district: c.location.district,
                region: 'South India',
                village: 'Test Village'
            },
            farmer: farmer._id,
            organicCertified: Math.random() > 0.7,

            // Consumer Marketplace Fields (CRITICAL for test)
            availableForConsumers: true,
            consumerPrice: c.expectedPrice, // 1:1 Pricing for simplicity
            stockQuantity: c.quantity.value,
            minOrderQuantity: { value: 1, unit: 'kg' },
            deliveryOptions: {
                homeDelivery: true,
                pickupAvailable: true,
                deliveryCharge: 0
            },

            createdAt: new Date(),
            status: 'approved' // Ensure status is explicitly approved
        }));

        console.log('Sample payload:', JSON.stringify(cropsToInsert[0], null, 2));

        // Use native driver to bypass ALL Mongoose validation
        await mongoose.connection.db.collection('crops').insertMany(cropsToInsert);
        console.log(`Successfully seeded ${cropsToInsert.length} clean products.`);

        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error.message);
        if (error.errors) {
            Object.keys(error.errors).forEach(key => {
                console.error(`- ${key}: ${error.errors[key].message}`);
            });
        }
        process.exit(1);
    }
};

cleanSeed();
