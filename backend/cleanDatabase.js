import mongoose from 'mongoose';
import Order from './models/Order.js';
import WholesaleOrder from './models/WholesaleOrder.js';
import Negotiation from './models/Negotiation.js';
import Chat from './models/Chat.js';
import Sample from './models/Sample.js';
import Crop from './models/Crop.js';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function cleanDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        console.log('🧹 Starting database cleanup...\n');

        // Delete all consumer orders
        const consumerOrdersCount = await Order.countDocuments();
        await Order.deleteMany({});
        console.log(`✅ Deleted ${consumerOrdersCount} consumer orders`);

        // Delete all wholesale orders
        const wholesaleOrdersCount = await WholesaleOrder.countDocuments();
        await WholesaleOrder.deleteMany({});
        console.log(`✅ Deleted ${wholesaleOrdersCount} wholesale orders`);

        // Delete all negotiations
        const negotiationsCount = await Negotiation.countDocuments();
        await Negotiation.deleteMany({});
        console.log(`✅ Deleted ${negotiationsCount} negotiations`);

        // Delete all chats
        const chatsCount = await Chat.countDocuments();
        await Chat.deleteMany({});
        console.log(`✅ Deleted ${chatsCount} chats`);

        // Delete all sample requests
        const samplesCount = await Sample.countDocuments();
        await Sample.deleteMany({});
        console.log(`✅ Deleted ${samplesCount} sample requests`);

        // Delete all crops (will be reseeded with 40 items)
        const cropsCount = await Crop.countDocuments();
        await Crop.deleteMany({});
        console.log(`✅ Deleted ${cropsCount} crops`);

        console.log('\n📊 Cleanup Summary:');
        console.log(`   Consumer Orders: ${consumerOrdersCount} deleted`);
        console.log(`   Wholesale Orders: ${wholesaleOrdersCount} deleted`);
        console.log(`   Negotiations: ${negotiationsCount} deleted`);
        console.log(`   Chats: ${chatsCount} deleted`);
        console.log(`   Sample Requests: ${samplesCount} deleted`);
        console.log(`   Crops: ${cropsCount} deleted`);

        // Keep users for authentication
        const usersCount = await User.countDocuments();
        console.log(`\n✅ Users preserved: ${usersCount}`);

        console.log('\n🎉 Database cleanup completed successfully!');
        console.log('💡 Next step: Run "node seed40crops.js" to populate with 40 crops\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

cleanDatabase();
