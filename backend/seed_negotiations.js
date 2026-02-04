import mongoose from 'mongoose';
import User from './models/User.js';
import Crop from './models/Crop.js';
import Negotiation from './models/Negotiation.js';
import Chat from './models/Chat.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/agrimart')
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ Connection error:', err));

const seedActiveData = async () => {
    try {
        // 1. Create Verified Users
        console.log('Creating verified users...');
        const users = [
            { name: 'John Doe', email: 'john@farmer.com', role: 'farmer', isVerified: true, phone: '9000000001', region: 'Punjab' },
            { name: 'Jane Smith', email: 'jane@wholesaler.com', role: 'wholesaler', isVerified: true, phone: '9000000002', region: 'Maharashtra' },
            { name: 'Bob Wilson', email: 'bob@farmer.com', role: 'farmer', isVerified: true, phone: '9000000003', region: 'Uttar Pradesh' },
            { name: 'Alice Brown', email: 'alice@wholesaler.com', role: 'wholesaler', isVerified: true, phone: '9000000004', region: 'Karnataka' },
            { name: 'Charlie Green', email: 'charlie@farmer.com', role: 'farmer', isVerified: false, phone: '9000000005', region: 'Bihar' },
        ];

        const createdUsers = [];
        for (const uData of users) {
            let user = await User.findOne({ email: uData.email });
            if (!user) {
                user = await User.create({ ...uData, password: 'password123' });
            } else {
                user.isVerified = uData.isVerified;
                await user.save();
            }
            createdUsers.push(user);
        }

        // 2. Ensure some crops exist
        const farmers = createdUsers.filter(u => u.role === 'farmer');
        const wholesalers = createdUsers.filter(u => u.role === 'wholesaler');

        let crops = await Crop.find({ farmer: farmers[0]._id });
        if (crops.length === 0) {
            console.log('Creating test crops...');
            crops = await Crop.create([
                {
                    name: 'Organic Wheat',
                    category: 'Cereals',
                    season: 'Rabi',
                    expectedPrice: 2500,
                    quantity: { value: 100, unit: 'quintal' },
                    location: { state: 'Punjab', district: 'Ludhiana', region: 'North India' },
                    farmer: farmers[0]._id,
                    status: 'approved',
                    availableForConsumers: true,
                    consumerPrice: 35,
                    stockQuantity: 1000
                },
                {
                    name: 'Basmati Rice',
                    category: 'Cereals',
                    season: 'Kharif',
                    expectedPrice: 4500,
                    quantity: { value: 50, unit: 'quintal' },
                    location: { state: 'Punjab', district: 'Amritsar', region: 'North India' },
                    farmer: farmers[0]._id,
                    status: 'approved',
                    availableForConsumers: true,
                    consumerPrice: 60,
                    stockQuantity: 500
                }
            ]);
        }

        // 3. Create Negotiations
        console.log('Creating sample negotiations...');
        await Negotiation.deleteMany({});
        await Chat.deleteMany({});

        const neg1 = await Negotiation.create({
            crop: crops[0]._id,
            farmer: farmers[0]._id,
            wholesaler: wholesalers[0]._id,
            initialPrice: 2500,
            status: 'ongoing',
            offerHistory: [
                { offeredBy: 'wholesaler', amount: 2200, quantity: { value: 100, unit: 'quintal' }, message: 'Offering 2200 for the whole lot.' },
                { offeredBy: 'farmer', amount: 2400, quantity: { value: 100, unit: 'quintal' }, message: 'I can do 2400.' }
            ],
            currentOffer: { amount: 2400, offeredBy: 'farmer' },
            agreedQuantity: { value: 100, unit: 'quintal' }
        });

        await Chat.create({
            negotiation: neg1._id,
            participants: { farmer: farmers[0]._id, wholesaler: wholesalers[0]._id },
            messages: [
                { sender: wholesalers[0]._id, senderRole: 'wholesaler', content: 'Hi, I am interested in your wheat.', messageType: 'text' },
                { sender: wholesalers[0]._id, senderRole: 'wholesaler', content: 'Offering 2200 for the whole lot.', messageType: 'offer' },
                { sender: farmers[0]._id, senderRole: 'farmer', content: 'The quality is very high, 2200 is too low.', messageType: 'text' },
                { sender: farmers[0]._id, senderRole: 'farmer', content: 'I can do 2400.', messageType: 'offer' }
            ]
        });

        const neg2 = await Negotiation.create({
            crop: crops[1]._id,
            farmer: farmers[0]._id,
            wholesaler: wholesalers[1]._id,
            initialPrice: 4500,
            status: 'accepted',
            offerHistory: [
                { offeredBy: 'wholesaler', amount: 4400, quantity: { value: 50, unit: 'quintal' }, message: 'Deal at 4400?' },
            ],
            currentOffer: { amount: 4400, offeredBy: 'wholesaler' },
            agreedQuantity: { value: 50, unit: 'quintal' },
            finalAgreedPrice: 4400,
            totalAmount: 220000,
            acceptedBy: 'farmer',
            acceptedAt: new Date()
        });

        await Chat.create({
            negotiation: neg2._id,
            participants: { farmer: farmers[0]._id, wholesaler: wholesalers[1]._id },
            messages: [
                { sender: wholesalers[1]._id, senderRole: 'wholesaler', content: 'Deal at 4400?', messageType: 'offer' },
                { sender: farmers[0]._id, senderRole: 'farmer', content: 'Accepted the offer of ₹4400', messageType: 'system' }
            ]
        });

        console.log('✅ Seeded active data for testing');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedActiveData();
