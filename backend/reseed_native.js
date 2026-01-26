import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const cleanSeedNative = async () => {
    let client;
    try {
        console.log('Connecting to MongoDB (Native Driver)...');
        client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db(); // Uses default DB from URI
        console.log('Connected.');

        // 1. Clear Data
        console.log('Clearing existing data...');
        // Inspect if collections exist first to avoid error? No, deleteMany works even if empty.
        await db.collection('crops').deleteMany({});
        await db.collection('orders').deleteMany({});
        await db.collection('negotiations').deleteMany({});
        console.log('Collections cleared.');

        // 2. Get or Create Farmer (We need ObjectId)
        let farmer = await db.collection('users').findOne({ role: 'farmer', email: 'farmer@test.com' });
        let farmerId;

        if (!farmer) {
            console.log('Creating test farmer...');
            const result = await db.collection('users').insertOne({
                name: 'Ramesh Farmer',
                email: 'farmer@test.com',
                password: 'password123', // Raw password for test
                phone: '9876543210',
                role: 'farmer',
                address: '123 Village Road, Guntur, AP',
                createdAt: new Date(),
                updatedAt: new Date()
            });
            farmerId = result.insertedId;
        } else {
            farmerId = farmer._id;
        }

        // 3. Define Crops
        const cropsToInsert = [
            {
                name: 'Tomato',
                category: 'Vegetables',
                season: 'Rabi',
                images: ['/images/crops/tomatoes.png'],
                expectedPrice: 2000,
                priceUnit: 'quintal',
                quantity: { value: 50, unit: 'quintal' },
                location: { state: 'Andhra Pradesh', district: 'Guntur', region: 'South India' },
                description: 'Fresh red tomatoes.',
                qualityGrade: 'Grade A',
                status: 'approved',

                farmer: farmerId,
                organicCertified: true,
                availableForConsumers: true,
                consumerPrice: 2000,
                stockQuantity: 50,
                minOrderQuantity: { value: 1, unit: 'kg' },
                deliveryOptions: { homeDelivery: true, pickupAvailable: true, deliveryCharge: 0 },
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Potato',
                category: 'Vegetables',
                season: 'Rabi',
                images: ['/images/crops/potatoes.png'],
                expectedPrice: 1500,
                priceUnit: 'quintal',
                quantity: { value: 100, unit: 'quintal' },
                location: { state: 'Uttar Pradesh', district: 'Agra', region: 'North India' },
                description: 'Large size potatoes.',
                qualityGrade: 'Grade A',
                status: 'approved',

                farmer: farmerId,
                organicCertified: false,
                availableForConsumers: true,
                consumerPrice: 1500,
                stockQuantity: 100,
                minOrderQuantity: { value: 1, unit: 'kg' },
                deliveryOptions: { homeDelivery: true, pickupAvailable: true, deliveryCharge: 0 },
                createdAt: new Date(),
                updatedAt: new Date()
            },
            // Add other critical props if needed, but 2-3 clean items are enough to prove the point.
            // Let's add Onion as requested.
            {
                name: 'Onion',
                category: 'Vegetables',
                season: 'Kharif',
                images: ['/images/crops/onions.png'],
                expectedPrice: 3000,
                priceUnit: 'quintal',
                quantity: { value: 40, unit: 'quintal' },
                location: { state: 'Maharashtra', district: 'Nashik', region: 'West India' },
                description: 'Red onions.',
                qualityGrade: 'Grade A',
                status: 'approved',

                farmer: farmerId,
                organicCertified: true,
                availableForConsumers: true,
                consumerPrice: 3000,
                stockQuantity: 40, // Ensure strictly number
                minOrderQuantity: { value: 1, unit: 'kg' },
                deliveryOptions: { homeDelivery: true, pickupAvailable: true, deliveryCharge: 0 },
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        // 4. Insert
        console.log('Inserting crops...');
        await db.collection('crops').insertMany(cropsToInsert);
        console.log(`Successfully seeded ${cropsToInsert.length} clean products using Native Driver.`);

        if (client) await client.close();
        process.exit(0);

    } catch (error) {
        console.error('Native Seed Failed:', error);
        if (client) await client.close();
        process.exit(1);
    }
};

cleanSeedNative();
