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
                name: 'Organic Tomatoes',
                category: 'Vegetables',
                season: 'Rabi',
                images: ['/images/crops/tomatoes.png'],
                expectedPrice: 4000,
                priceUnit: 'quintal',
                quantity: { value: 10000, unit: 'kg' },
                location: { state: 'Andhra Pradesh', district: 'Guntur', region: 'South India' },
                description: 'Farm-fresh, vine-ripened organic tomatoes. Perfect for salads and cooking.',
                qualityGrade: 'Grade A',
                status: 'approved',
                farmer: farmerId,
                organicCertified: true,
                availableForConsumers: true,
                consumerPrice: 40,
                stockQuantity: 10000,
                minOrderQuantity: { value: 1, unit: 'kg' },
                deliveryOptions: { homeDelivery: true, pickupAvailable: true, deliveryCharge: 30 },
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Premium Potatoes',
                category: 'Vegetables',
                season: 'Rabi',
                images: ['/images/crops/potatoes.png'],
                expectedPrice: 2000,
                priceUnit: 'quintal',
                quantity: { value: 50000, unit: 'kg' },
                location: { state: 'Uttar Pradesh', district: 'Agra', region: 'North India' },
                description: 'High-quality starchy potatoes, ideal for frying and boiling.',
                qualityGrade: 'Grade A',
                status: 'approved',
                farmer: farmerId,
                organicCertified: false,
                availableForConsumers: true,
                consumerPrice: 25,
                stockQuantity: 50000,
                minOrderQuantity: { value: 2, unit: 'kg' },
                deliveryOptions: { homeDelivery: true, pickupAvailable: true, deliveryCharge: 20 },
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Red Onions',
                category: 'Vegetables',
                season: 'Kharif',
                images: ['/images/crops/onions.png'],
                expectedPrice: 3500,
                priceUnit: 'quintal',
                quantity: { value: 30000, unit: 'kg' },
                location: { state: 'Maharashtra', district: 'Nashik', region: 'West India' },
                description: 'Pungent and flavorful red onions from the heart of Nashik.',
                qualityGrade: 'Grade A',
                status: 'approved',
                farmer: farmerId,
                organicCertified: false,
                availableForConsumers: true,
                consumerPrice: 45,
                stockQuantity: 30000,
                minOrderQuantity: { value: 1, unit: 'kg' },
                deliveryOptions: { homeDelivery: true, pickupAvailable: true, deliveryCharge: 25 },
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Alphonso Mangoes',
                category: 'Fruits',
                season: 'Zaid',
                images: ['/images/crops/mangoes.png'],
                expectedPrice: 15000,
                priceUnit: 'quintal',
                quantity: { value: 50, unit: 'quintal' },
                location: { state: 'Maharashtra', district: 'Ratnagiri', region: 'West India' },
                description: 'The King of Mangoes. Sweet, pulpy, and aromatic Alphonso mangoes.',
                qualityGrade: 'Premium',
                status: 'approved',
                farmer: farmerId,
                organicCertified: true,
                availableForConsumers: true,
                consumerPrice: 180,
                stockQuantity: 200,
                minOrderQuantity: { value: 1, unit: 'kg' },
                deliveryOptions: { homeDelivery: true, pickupAvailable: true, deliveryCharge: 50 },
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Basmati Rice',
                category: 'Cereals',
                season: 'Kharif',
                images: ['/images/crops/paddy.png'],
                expectedPrice: 8000,
                priceUnit: 'quintal',
                quantity: { value: 100000, unit: 'kg' },
                location: { state: 'Haryana', district: 'Karnal', region: 'North India' },
                description: 'Long-grain, aged Basmati rice with a delightful aroma.',
                qualityGrade: 'Premium',
                status: 'approved',
                farmer: farmerId,
                organicCertified: false,
                availableForConsumers: true,
                consumerPrice: 120,
                stockQuantity: 100000,
                minOrderQuantity: { value: 5, unit: 'kg' },
                deliveryOptions: { homeDelivery: true, pickupAvailable: true, deliveryCharge: 0 },
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Golden Wheat',
                category: 'Cereals',
                season: 'Rabi',
                images: ['/images/crops/wheat.png'],
                expectedPrice: 2500,
                priceUnit: 'quintal',
                quantity: { value: 200000, unit: 'kg' },
                location: { state: 'Punjab', district: 'Ludhiana', region: 'North India' },
                description: 'High-protein golden wheat, freshly harvested and cleaned.',
                qualityGrade: 'Grade A',
                status: 'approved',
                farmer: farmerId,
                organicCertified: false,
                availableForConsumers: true,
                consumerPrice: 35,
                stockQuantity: 200000,
                minOrderQuantity: { value: 10, unit: 'kg' },
                deliveryOptions: { homeDelivery: true, pickupAvailable: true, deliveryCharge: 100 },
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Shimla Apples',
                category: 'Fruits',
                season: 'Rabi',
                images: ['/images/crops/apple.png'],
                expectedPrice: 10000,
                priceUnit: 'quintal',
                quantity: { value: 150, unit: 'quintal' },
                location: { state: 'Himachal Pradesh', district: 'Shimla', region: 'North India' },
                description: 'Crisp and juicy red apples from the orchards of Shimla.',
                qualityGrade: 'Grade A',
                status: 'approved',
                farmer: farmerId,
                organicCertified: true,
                availableForConsumers: true,
                consumerPrice: 150,
                stockQuantity: 400,
                minOrderQuantity: { value: 1, unit: 'kg' },
                deliveryOptions: { homeDelivery: true, pickupAvailable: true, deliveryCharge: 40 },
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Cavendish Bananas',
                category: 'Fruits',
                season: 'Year-Round',
                images: ['/images/crops/bananas.png'],
                expectedPrice: 3000,
                priceUnit: 'quintal',
                quantity: { value: 400, unit: 'quintal' },
                location: { state: 'Tamil Nadu', district: 'Trichy', region: 'South India' },
                description: 'Fresh, ripe Cavendish bananas. Great source of potassium.',
                qualityGrade: 'Grade A',
                status: 'approved',
                farmer: farmerId,
                organicCertified: false,
                availableForConsumers: true,
                consumerPrice: 50,
                stockQuantity: 1000,
                minOrderQuantity: { value: 1, unit: 'kg' },
                deliveryOptions: { homeDelivery: true, pickupAvailable: true, deliveryCharge: 20 },
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Orange Carrots',
                category: 'Vegetables',
                season: 'Rabi',
                images: ['/images/crops/carrots.png'],
                expectedPrice: 3000,
                priceUnit: 'quintal',
                quantity: { value: 100, unit: 'quintal' },
                location: { state: 'Rajasthan', district: 'Jaipur', region: 'North India' },
                description: 'Sweet and crunchy orange carrots, freshly pulled from the soil.',
                qualityGrade: 'Grade A',
                status: 'approved',
                farmer: farmerId,
                organicCertified: true,
                availableForConsumers: true,
                consumerPrice: 40,
                stockQuantity: 300,
                minOrderQuantity: { value: 1, unit: 'kg' },
                deliveryOptions: { homeDelivery: true, pickupAvailable: true, deliveryCharge: 15 },
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Green Chillies',
                category: 'Spices',
                season: 'Year-Round',
                images: ['/images/crops/chilli.png'],
                expectedPrice: 5000,
                priceUnit: 'quintal',
                quantity: { value: 80, unit: 'quintal' },
                location: { state: 'Karnataka', district: 'Guntur', region: 'South India' },
                description: 'Spicy and fresh green chillies to add heat to your dishes.',
                qualityGrade: 'Grade A',
                status: 'approved',
                farmer: farmerId,
                organicCertified: false,
                availableForConsumers: true,
                consumerPrice: 80,
                stockQuantity: 200,
                minOrderQuantity: { value: 0.25, unit: 'kg' },
                deliveryOptions: { homeDelivery: true, pickupAvailable: true, deliveryCharge: 10 },
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Fresh Garlic',
                category: 'Spices',
                season: 'Rabi',
                images: ['/images/crops/garlic.png'],
                expectedPrice: 12000,
                priceUnit: 'quintal',
                quantity: { value: 60, unit: 'quintal' },
                location: { state: 'Madhya Pradesh', district: 'Mandsaur', region: 'Central India' },
                description: 'Aromatic and strong-flavored fresh garlic bulbs.',
                qualityGrade: 'Grade A',
                status: 'approved',
                farmer: farmerId,
                organicCertified: false,
                availableForConsumers: true,
                consumerPrice: 150,
                stockQuantity: 150,
                minOrderQuantity: { value: 0.5, unit: 'kg' },
                deliveryOptions: { homeDelivery: true, pickupAvailable: true, deliveryCharge: 10 },
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Organic Turmeric',
                category: 'Spices',
                season: 'Kharif',
                images: ['/images/crops/turmeric.png'],
                expectedPrice: 9000,
                priceUnit: 'quintal',
                quantity: { value: 120, unit: 'quintal' },
                location: { state: 'Telangana', district: 'Nizamabad', region: 'South India' },
                description: 'Pure, organic turmeric fingers with high curcumin content.',
                qualityGrade: 'Premium',
                status: 'approved',
                farmer: farmerId,
                organicCertified: true,
                availableForConsumers: true,
                consumerPrice: 180,
                stockQuantity: 400,
                minOrderQuantity: { value: 0.5, unit: 'kg' },
                deliveryOptions: { homeDelivery: true, pickupAvailable: true, deliveryCharge: 20 },
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Nagpur Oranges',
                category: 'Fruits',
                season: 'Rabi',
                images: ['/images/crops/oranges.png'],
                expectedPrice: 6000,
                priceUnit: 'quintal',
                quantity: { value: 200, unit: 'quintal' },
                location: { state: 'Maharashtra', district: 'Nagpur', region: 'West India' },
                description: 'Zesty and sweet oranges from Nagpur.',
                qualityGrade: 'Grade A',
                status: 'approved',
                farmer: farmerId,
                organicCertified: false,
                availableForConsumers: true,
                consumerPrice: 80,
                stockQuantity: 600,
                minOrderQuantity: { value: 2, unit: 'kg' },
                deliveryOptions: { homeDelivery: true, pickupAvailable: true, deliveryCharge: 30 },
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Fresh Ginger',
                category: 'Spices',
                season: 'Kharif',
                images: ['/images/crops/ginger.png'],
                expectedPrice: 11000,
                priceUnit: 'quintal',
                quantity: { value: 90, unit: 'quintal' },
                location: { state: 'Kerala', district: 'Wayanad', region: 'South India' },
                description: 'Fiery and fresh ginger roots from Wayanad.',
                qualityGrade: 'Grade A',
                status: 'approved',
                farmer: farmerId,
                organicCertified: true,
                availableForConsumers: true,
                consumerPrice: 140,
                stockQuantity: 250,
                minOrderQuantity: { value: 0.25, unit: 'kg' },
                deliveryOptions: { homeDelivery: true, pickupAvailable: true, deliveryCharge: 10 },
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Green Cauliflower',
                category: 'Vegetables',
                season: 'Rabi',
                images: ['/images/crops/cauliflower.png'],
                expectedPrice: 3500,
                priceUnit: 'quintal',
                quantity: { value: 70, unit: 'quintal' },
                location: { state: 'West Bengal', district: 'Hooghly', region: 'East India' },
                description: 'Fresh and compact green cauliflower heads.',
                qualityGrade: 'Grade A',
                status: 'approved',
                farmer: farmerId,
                organicCertified: false,
                availableForConsumers: true,
                consumerPrice: 50,
                stockQuantity: 200,
                minOrderQuantity: { value: 1, unit: 'piece' },
                deliveryOptions: { homeDelivery: true, pickupAvailable: true, deliveryCharge: 10 },
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
