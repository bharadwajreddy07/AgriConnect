import mongoose from 'mongoose';
import Crop from './models/Crop.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/agrimart')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err);
        process.exit(1);
    });

async function updateCrops() {
    try {
        console.log('🔄 Updating all crops to be available for consumers...\n');

        // Update all approved crops to be available for consumers
        const result = await Crop.updateMany(
            { status: 'approved' },
            {
                $set: {
                    availableForConsumers: true,
                    stockQuantity: 500,
                    'minOrderQuantity.value': 1,
                    'minOrderQuantity.unit': 'kg',
                    'deliveryOptions.homeDelivery': true,
                    'deliveryOptions.pickupAvailable': true,
                    'deliveryOptions.deliveryCharge': 50
                }
            }
        );

        console.log(`✅ Updated ${result.modifiedCount} crops!`);

        // Count total crops
        const totalCrops = await Crop.countDocuments({ status: 'approved' });
        console.log(`📊 Total approved crops: ${totalCrops}`);

        // Show breakdown by category
        const categories = await Crop.aggregate([
            { $match: { status: 'approved' } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        console.log('\n📈 Breakdown by category:');
        categories.forEach(cat => {
            console.log(`   ${cat._id}: ${cat.count} crops`);
        });

        console.log('\n🎉 All crops are now available for consumers!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error updating crops:', error);
        process.exit(1);
    }
}

updateCrops();
