import mongoose from 'mongoose';
import User from './models/User.js';
import Crop from './models/Crop.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Sample crop data
const cropTemplates = [
    { name: 'Paddy', category: 'Cereals', season: 'Kharif', priceRange: [2000, 3000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80' },
    { name: 'Wheat', category: 'Cereals', season: 'Rabi', priceRange: [1800, 2500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80' },
    { name: 'Maize', category: 'Cereals', season: 'Kharif', priceRange: [1500, 2200], unit: 'quintal', image: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=800&q=80' },
    { name: 'Barley', category: 'Cereals', season: 'Rabi', priceRange: [1600, 2300], unit: 'quintal', image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&q=80' },
    { name: 'Millets', category: 'Cereals', season: 'Kharif', priceRange: [2500, 3500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1599909533730-f9d7e4c2f5b5?w=800&q=80' },
    { name: 'Chickpeas', category: 'Pulses', season: 'Rabi', priceRange: [5000, 7000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1610988924854-e3c2f8c4d9a2?w=800&q=80' },
    { name: 'Lentils', category: 'Pulses', season: 'Rabi', priceRange: [5500, 7500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&q=80' },
    { name: 'Green Gram', category: 'Pulses', season: 'Kharif', priceRange: [6000, 8000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=800&q=80' },
    { name: 'Black Gram', category: 'Pulses', season: 'Kharif', priceRange: [6500, 8500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1596040033229-a0b3b83b6aec?w=800&q=80' },
    { name: 'Pigeon Pea', category: 'Pulses', season: 'Kharif', priceRange: [5800, 7800], unit: 'quintal', image: 'https://images.unsplash.com/photo-1610988924854-e3c2f8c4d9a2?w=800&q=80' },
    { name: 'Cotton', category: 'Cash Crops', season: 'Kharif', priceRange: [4500, 6000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1615485500834-bc10199bc727?w=800&q=80' },
    { name: 'Sugarcane', category: 'Cash Crops', season: 'Year-Round', priceRange: [2800, 3800], unit: 'ton', image: 'https://images.unsplash.com/photo-1583484963886-cfe2a9a8c3ce?w=800&q=80' },
    { name: 'Jute', category: 'Cash Crops', season: 'Kharif', priceRange: [3500, 4500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80' },
    { name: 'Groundnut', category: 'Oilseeds', season: 'Kharif', priceRange: [4500, 6000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=800&q=80' },
    { name: 'Mustard', category: 'Oilseeds', season: 'Rabi', priceRange: [4000, 5500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80' },
    { name: 'Sunflower', category: 'Oilseeds', season: 'Kharif', priceRange: [4200, 5800], unit: 'quintal', image: 'https://images.unsplash.com/photo-1597848212624-e4c0e8b0a266?w=800&q=80' },
    { name: 'Sesame', category: 'Oilseeds', season: 'Kharif', priceRange: [7000, 9000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800&q=80' },
    { name: 'Soybean', category: 'Oilseeds', season: 'Kharif', priceRange: [3500, 4800], unit: 'quintal', image: 'https://images.unsplash.com/photo-1596040033229-a0b3b83b6aec?w=800&q=80' },
    { name: 'Tomatoes', category: 'Vegetables', season: 'Zaid', priceRange: [1500, 3500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1546470427-227a4e2c2f0f?w=800&q=80' },
    { name: 'Onions', category: 'Vegetables', season: 'Rabi', priceRange: [1200, 2500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&q=80' },
    { name: 'Potatoes', category: 'Vegetables', season: 'Rabi', priceRange: [800, 1500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80' },
    { name: 'Cabbage', category: 'Vegetables', season: 'Rabi', priceRange: [1000, 1800], unit: 'quintal', image: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=800&q=80' },
    { name: 'Cauliflower', category: 'Vegetables', season: 'Rabi', priceRange: [1200, 2000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1568584711271-61dd0b8a4b3c?w=800&q=80' },
    { name: 'Carrots', category: 'Vegetables', season: 'Rabi', priceRange: [1500, 2500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&q=80' },
    { name: 'Brinjal', category: 'Vegetables', season: 'Year-Round', priceRange: [1800, 3000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1618611901209-b4f87c6e9f97?w=800&q=80' },
    { name: 'Okra', category: 'Vegetables', season: 'Kharif', priceRange: [2000, 3500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1599909533730-f9d7e4c2f5b5?w=800&q=80' },
    { name: 'Cucumber', category: 'Vegetables', season: 'Zaid', priceRange: [1500, 2500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=800&q=80' },
    { name: 'Pumpkin', category: 'Vegetables', season: 'Kharif', priceRange: [800, 1500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=800&q=80' },
    { name: 'Bananas', category: 'Fruits', season: 'Year-Round', priceRange: [2000, 3500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&q=80' },
    { name: 'Mangoes', category: 'Fruits', season: 'Zaid', priceRange: [3000, 5000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800&q=80' },
    { name: 'Apples', category: 'Fruits', season: 'Rabi', priceRange: [5000, 8000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&q=80' },
    { name: 'Grapes', category: 'Fruits', season: 'Rabi', priceRange: [4000, 6500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1599819177924-d83ec9c9978a?w=800&q=80' },
    { name: 'Oranges', category: 'Fruits', season: 'Rabi', priceRange: [2500, 4000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?w=800&q=80' },
    { name: 'Papayas', category: 'Fruits', season: 'Year-Round', priceRange: [1500, 2500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=800&q=80' },
    { name: 'Watermelon', category: 'Fruits', season: 'Zaid', priceRange: [800, 1500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784acc?w=800&q=80' },
    { name: 'Guava', category: 'Fruits', season: 'Year-Round', priceRange: [2000, 3000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=800&q=80' },
    { name: 'Turmeric', category: 'Spices', season: 'Kharif', priceRange: [6000, 9000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80' },
    { name: 'Chilli', category: 'Spices', season: 'Kharif', priceRange: [8000, 12000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=800&q=80' },
    { name: 'Coriander', category: 'Spices', season: 'Rabi', priceRange: [5000, 7000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1599909533730-f9d7e4c2f5b5?w=800&q=80' },
    { name: 'Cumin', category: 'Spices', season: 'Rabi', priceRange: [15000, 20000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1596040033229-a0b3b83b6aec?w=800&q=80' },
    { name: 'Ginger', category: 'Spices', season: 'Kharif', priceRange: [4000, 6000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80' },
    { name: 'Garlic', category: 'Spices', season: 'Rabi', priceRange: [3500, 5500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&q=80' },
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

const qualityGrades = ['A+', 'A', 'B+', 'B', 'C'];
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

        // Step 1: Create sample farmers
        console.log('👨‍🌾 Creating sample farmers...');

        const farmerData = [
            { name: 'Rajesh Kumar', email: 'rajesh@farmer.com', phone: '9876543210', region: 'Punjab' },
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

        // Step 2: Create 400 crops
        console.log('🌾 Creating 400 sample crops...');
        const cropsToCreate = [];

        for (let i = 0; i < 400; i++) {
            const template = getRandomItem(cropTemplates);
            const state = getRandomItem(indianStates);
            const district = getRandomItem(districts[state] || [state]);
            const farmer = getRandomItem(farmers);

            const crop = {
                name: template.name,
                category: template.category,
                season: template.season,
                expectedPrice: getRandomPrice(template.priceRange),
                quantity: {
                    value: getRandomInRange(10, 500),
                    unit: template.unit
                },
                qualityGrade: getRandomItem(qualityGrades),
                description: `Premium quality ${template.name} from ${district}, ${state}. Freshly harvested and ready for wholesale.`,
                location: {
                    state: state,
                    district: district,
                    pincode: getRandomInRange(100000, 999999).toString()
                },
                images: [template.image],
                farmer: farmer._id,
                status: 'approved',
                isOrganic: Math.random() > 0.7,
                harvestDate: new Date(Date.now() - getRandomInRange(1, 30) * 24 * 60 * 60 * 1000),
                availableFrom: new Date(),
                availableUntil: new Date(Date.now() + getRandomInRange(30, 90) * 24 * 60 * 60 * 1000),
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
