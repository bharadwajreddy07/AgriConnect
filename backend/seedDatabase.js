import mongoose from 'mongoose';
import User from './models/User.js';
import Crop from './models/Crop.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Sample crop data
const cropTemplates = [
    // Cereals
    { name: 'Paddy', category: 'Cereals', season: 'Kharif', priceRange: [2000, 3000], unit: 'quintal', image: '/images/crops/paddy.png' },
    { name: 'Wheat', category: 'Cereals', season: 'Rabi', priceRange: [1800, 2500], unit: 'quintal', image: '/images/crops/wheat.png' },
    { name: 'Maize', category: 'Cereals', season: 'Kharif', priceRange: [1500, 2200], unit: 'quintal', image: '/images/crops/maize.png' },
    { name: 'Barley', category: 'Cereals', season: 'Rabi', priceRange: [1600, 2300], unit: 'quintal', image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&q=80' },
    { name: 'Millets', category: 'Cereals', season: 'Kharif', priceRange: [2500, 3500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1599909533730-f9d7e4c2f5b5?w=800&q=80' },

    // Pulses
    { name: 'Chickpeas', category: 'Pulses', season: 'Rabi', priceRange: [5000, 7000], unit: 'quintal', image: '/images/crops/pulses.png' },
    { name: 'Lentils', category: 'Pulses', season: 'Rabi', priceRange: [5500, 7500], unit: 'quintal', image: '/images/crops/pulses.png' },
    { name: 'Green Gram', category: 'Pulses', season: 'Kharif', priceRange: [6000, 8000], unit: 'quintal', image: '/images/crops/pulses.png' },
    { name: 'Black Gram', category: 'Pulses', season: 'Kharif', priceRange: [6500, 8500], unit: 'quintal', image: '/images/crops/pulses.png' },
    { name: 'Pigeon Pea', category: 'Pulses', season: 'Kharif', priceRange: [5800, 7800], unit: 'quintal', image: '/images/crops/pulses.png' },

    // Cash Crops
    { name: 'Cotton', category: 'Cash Crops', season: 'Kharif', priceRange: [4500, 6000], unit: 'quintal', image: '/images/crops/cotton.png' }, // White Cotton
    { name: 'Sugarcane', category: 'Cash Crops', season: 'Year-Round', priceRange: [2800, 3800], unit: 'ton', image: '/images/crops/sugarcane.png' },
    { name: 'Jute', category: 'Cash Crops', season: 'Kharif', priceRange: [3500, 4500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1597848212624-e4c0e8b0a266?w=800&q=80' }, // Rope/Fiber like

    // Oilseeds
    { name: 'Groundnut', category: 'Oilseeds', season: 'Kharif', priceRange: [4500, 6000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=800&q=80' },
    { name: 'Mustard', category: 'Oilseeds', season: 'Rabi', priceRange: [4000, 5500], unit: 'quintal', image: '/images/crops/mustard.png' }, // Yellow flowers/seeds
    { name: 'Sunflower', category: 'Oilseeds', season: 'Kharif', priceRange: [4200, 5800], unit: 'quintal', image: 'https://images.unsplash.com/photo-1597848212624-e4c0e8b0a266?w=800&q=80' },
    { name: 'Sesame', category: 'Oilseeds', season: 'Kharif', priceRange: [7000, 9000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=800&q=80' },
    { name: 'Soybean', category: 'Oilseeds', season: 'Kharif', priceRange: [3500, 4800], unit: 'quintal', image: 'https://images.unsplash.com/photo-1615485925694-a0319ca73041?w=800&q=80' },

    // Vegetables
    { name: 'Tomatoes', category: 'Vegetables', season: 'Zaid', priceRange: [1500, 3500], unit: 'quintal', image: '/images/crops/tomatoes.png' },
    { name: 'Onions', category: 'Vegetables', season: 'Rabi', priceRange: [1200, 2500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&q=80' },
    { name: 'Potatoes', category: 'Vegetables', season: 'Rabi', priceRange: [800, 1500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80' },
    { name: 'Cabbage', category: 'Vegetables', season: 'Rabi', priceRange: [1000, 1800], unit: 'quintal', image: '/images/crops/cabbage.png' },
    { name: 'Cauliflower', category: 'Vegetables', season: 'Rabi', priceRange: [1200, 2000], unit: 'quintal', image: '/images/crops/cauliflower.png' },
    { name: 'Carrots', category: 'Vegetables', season: 'Rabi', priceRange: [1500, 2500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&q=80' },
    { name: 'Brinjal', category: 'Vegetables', season: 'Year-Round', priceRange: [1800, 3000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1618611901209-b4f87c6e9f97?w=800&q=80' }, // Eggplant
    { name: 'Okra', category: 'Vegetables', season: 'Kharif', priceRange: [2000, 3500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1425543103986-226d3d8d17d8?w=800&q=80' },
    { name: 'Cucumber', category: 'Vegetables', season: 'Zaid', priceRange: [1500, 2500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1604977042946-1eecc6a30d73?w=800&q=80' },
    { name: 'Pumpkin', category: 'Vegetables', season: 'Kharif', priceRange: [800, 1500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1506917728037-b6af011561e6?w=800&q=80' },

    // Fruits
    { name: 'Bananas', category: 'Fruits', season: 'Year-Round', priceRange: [2000, 3500], unit: 'quintal', image: '/images/crops/bananas.png' },
    { name: 'Mangoes', category: 'Fruits', season: 'Zaid', priceRange: [3000, 5000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800&q=80' },
    { name: 'Apples', category: 'Fruits', season: 'Rabi', priceRange: [5000, 8000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&q=80' },
    { name: 'Grapes', category: 'Fruits', season: 'Rabi', priceRange: [4000, 6500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1537640538965-17562995e9bb?w=800&q=80' }, // Green Grapes
    { name: 'Oranges', category: 'Fruits', season: 'Rabi', priceRange: [2500, 4000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=800&q=80' },
    { name: 'Papayas', category: 'Fruits', season: 'Year-Round', priceRange: [1500, 2500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1617112848923-cc5c3ac3514c?w=800&q=80' },
    { name: 'Watermelon', category: 'Fruits', season: 'Zaid', priceRange: [800, 1500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&q=80' },
    { name: 'Guava', category: 'Fruits', season: 'Year-Round', priceRange: [2000, 3000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1536968771144-884d635c7546?w=800&q=80' },

    // Spices
    { name: 'Turmeric', category: 'Spices', season: 'Kharif', priceRange: [6000, 9000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80' }, // Yellow powder/roots
    { name: 'Chilli', category: 'Spices', season: 'Kharif', priceRange: [8000, 12000], unit: 'quintal', image: '/images/crops/chilli.png' }, // REAL Red Chillies (not sushi)
    { name: 'Coriander', category: 'Spices', season: 'Rabi', priceRange: [5000, 7000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80' },
    { name: 'Cumin', category: 'Spices', season: 'Rabi', priceRange: [15000, 20000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80' },
    { name: 'Ginger', category: 'Spices', season: 'Kharif', priceRange: [4000, 6000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1615485925602-3b6a9559d937?w=800&q=80' },
    { name: 'Garlic', category: 'Spices', season: 'Rabi', priceRange: [3500, 5500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1551061737-0e6d62870425?w=800&q=80' },
];

const indianStates = ['Punjab', 'Haryana', 'Uttar Pradesh', 'Bihar', 'West Bengal', 'Maharashtra', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'Kerala'];
const districts = {
    'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar'],
    'Haryana': ['Karnal', 'Hisar', 'Rohtak'],
    'Uttar Pradesh': ['Meerut', 'Agra', 'Lucknow'],
    'Maharashtra': ['Pune', 'Nashik', 'Nagpur'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara'],
    'Karnataka': ['Bangalore', 'Mysore', 'Belgaum'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai'],
    'Kerala': ['Kochi', 'Kozhikode', 'Thrissur'],
};

const qualityGrades = ['Premium', 'Grade A', 'Grade B', 'Standard'];
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomPrice = (range) => getRandomInRange(range[0], range[1]);

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/agrimart')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err);
        process.exit(1);
    });

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...\n');

        // Step 0: Clear existing data
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Crop.deleteMany({});
        console.log('✅ Database cleared\n');

        // Step 1: Create sample farmers
        console.log('👨‍🌾 Creating sample farmers...');


        const farmerData = [
            { name: 'Kalyan', email: 'kalyan@farmer.com', phone: '9876543210', region: 'Andhra Pradesh' }, // User's Persona
            { name: 'Suresh Patel', email: 'suresh@farmer.com', phone: '9876543211', region: 'Gujarat' },
            { name: 'Ramesh Singh', email: 'ramesh@farmer.com', phone: '9876543212', region: 'Haryana' },
            { name: 'Mahesh Reddy', email: 'mahesh@farmer.com', phone: '9876543213', region: 'Karnataka' },
            { name: 'Ganesh Yadav', email: 'ganesh@farmer.com', phone: '9876543214', region: 'Maharashtra' },
            { name: 'Dinesh Sharma', email: 'dinesh@farmer.com', phone: '9876543215', region: 'Uttar Pradesh' },
            { name: 'Mukesh Verma', email: 'mukesh@farmer.com', phone: '9876543216', region: 'Tamil Nadu' },
            { name: 'Naresh Nair', email: 'naresh@farmer.com', phone: '9876543217', region: 'Kerala' },
        ];

        const farmers = [];
        for (const data of farmerData) {
            const farmer = new User({
                name: data.name,
                email: data.email,
                password: 'password123', // Will be hashed by pre-save hook
                phone: data.phone,
                role: 'farmer',
                region: data.region,
                isVerified: true,
            });
            await farmer.save();
            farmers.push(farmer);
        }

        console.log(`✅ Created ${farmers.length} farmers\n`);

        // Step 2: Create 100 crops with consumer marketplace data
        console.log('🌾 Creating 100 sample crops...');
        const cropsToCreate = [];

        // Generate 50 sample crops
        for (let i = 0; i < 50; i++) {
            const template = getRandomItem(cropTemplates);
            const state = getRandomItem(indianStates);
            const district = getRandomItem(districts[state] || [state]);

            // Assign first 20 crops to the first farmer (Kalyan - Demo User)
            // This ensures negotiation testing works reliably for the demo user
            const farmer = i < 20 ? farmers[0] : getRandomItem(farmers);

            const expectedPrice = getRandomPrice(template.priceRange);
            const consumerPrice = Math.round(expectedPrice * 1.2); // 20% markup for consumers

            const crop = {
                name: template.name,
                category: template.category,
                season: template.season,
                expectedPrice: expectedPrice,
                quantity: {
                    value: getRandomInRange(10, 500),
                    unit: template.unit
                },
                qualityGrade: getRandomItem(qualityGrades),
                description: `Premium quality ${template.name} from ${district}, ${state}. Freshly harvested and ready for wholesale.`,
                location: {
                    region: state,
                    state: state,
                    district: district,
                    pincode: getRandomInRange(100000, 999999).toString()
                },
                images: template.image ? [template.image] : [], // Use template image if exists
                farmer: farmer._id,
                status: 'approved',
                organicCertified: Math.random() > 0.7,
                harvestDate: new Date(Date.now() - getRandomInRange(1, 30) * 24 * 60 * 60 * 1000),
                availableFrom: new Date(),
                availableUntil: new Date(Date.now() + getRandomInRange(30, 90) * 24 * 60 * 60 * 1000),
                // Consumer marketplace fields
                availableForConsumers: true,
                consumerPrice: consumerPrice,
                stockQuantity: getRandomInRange(50, 500),
                minOrderQuantity: {
                    value: 1,
                    unit: 'kg'
                },
                deliveryOptions: {
                    homeDelivery: true,
                    pickupAvailable: true,
                    deliveryCharge: 60
                }
            };

            cropsToCreate.push(crop);
        }

        const createdCrops = await Crop.insertMany(cropsToCreate);

        console.log(`✅ Successfully created ${createdCrops.length} crops!\n`);
        console.log('📈 Breakdown by category:');

        const breakdown = {};
        createdCrops.forEach(crop => {
            breakdown[crop.category] = (breakdown[crop.category] || 0) + 1;
        });

        Object.entries(breakdown).forEach(([category, count]) => {
            console.log(`   ${category}: ${count} crops`);
        });

        console.log('\n🎉 Database seeding completed successfully!');
        console.log('\n📝 Sample farmer credentials:');
        console.log('   Email: rajesh@farmer.com');
        console.log('   Password: password123');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
