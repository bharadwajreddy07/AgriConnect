import mongoose from 'mongoose';
import User from './models/User.js';
import Crop from './models/Crop.js';
import dotenv from 'dotenv';

dotenv.config();

// Sample crop data with accurate product images
const cropTemplates = [
    { name: 'Paddy', category: 'Cereals', season: 'Kharif', priceRange: [2000, 3000], unit: 'quintal', image: '/images/crops/paddy.png' },
    { name: 'Wheat', category: 'Cereals', season: 'Rabi', priceRange: [1800, 2500], unit: 'quintal', image: '/images/crops/wheat.png' },
    { name: 'Maize', category: 'Cereals', season: 'Kharif', priceRange: [1500, 2200], unit: 'quintal', image: '/images/crops/maize.png' },
    { name: 'Barley', category: 'Cereals', season: 'Rabi', priceRange: [1600, 2300], unit: 'quintal', image: '/images/crops/barley.jpg' },
    { name: 'Millets', category: 'Cereals', season: 'Kharif', priceRange: [2500, 3500], unit: 'quintal', image: '/images/crops/millets.png' },
    { name: 'Chickpeas', category: 'Pulses', season: 'Rabi', priceRange: [5000, 7000], unit: 'quintal', image: '/images/crops/chickpeas.jpg' },
    { name: 'Lentils', category: 'Pulses', season: 'Rabi', priceRange: [5500, 7500], unit: 'quintal', image: '/images/crops/lentils.png' },
    { name: 'Green Gram', category: 'Pulses', season: 'Kharif', priceRange: [6000, 8000], unit: 'quintal', image: '/images/crops/greengram.jpg' },
    { name: 'Black Gram', category: 'Pulses', season: 'Kharif', priceRange: [6500, 8500], unit: 'quintal', image: '/images/crops/blackgram.jpg' },
    { name: 'Pigeon Pea', category: 'Pulses', season: 'Kharif', priceRange: [5800, 7800], unit: 'quintal', image: '/images/crops/pigeonpea.jpg' },
    { name: 'Cotton', category: 'Cash Crops', season: 'Kharif', priceRange: [4500, 6000], unit: 'quintal', image: '/images/crops/cotton.png' },
    { name: 'Sugarcane', category: 'Cash Crops', season: 'Year-Round', priceRange: [2800, 3800], unit: 'ton', image: '/images/crops/sugarcane.png' },
    { name: 'Jute', category: 'Cash Crops', season: 'Kharif', priceRange: [3500, 4500], unit: 'quintal', image: '/images/crops/jute.jpg' },
    { name: 'Groundnut', category: 'Oilseeds', season: 'Kharif', priceRange: [4500, 6000], unit: 'quintal', image: '/images/crops/groundnut.png' },
    { name: 'Mustard', category: 'Oilseeds', season: 'Rabi', priceRange: [4000, 5500], unit: 'quintal', image: '/images/crops/mustard.png' },
    { name: 'Sunflower', category: 'Oilseeds', season: 'Kharif', priceRange: [4200, 5800], unit: 'quintal', image: '/images/crops/sunflower.png' },
    { name: 'Sesame', category: 'Oilseeds', season: 'Kharif', priceRange: [7000, 9000], unit: 'quintal', image: '/images/crops/sesame.png' },
    { name: 'Soybean', category: 'Oilseeds', season: 'Kharif', priceRange: [3500, 4800], unit: 'quintal', image: '/images/crops/soybean.png' },
    { name: 'Tomatoes', category: 'Vegetables', season: 'Zaid', priceRange: [1500, 3500], unit: 'quintal', image: '/images/crops/tomatoes.png' },
    { name: 'Onions', category: 'Vegetables', season: 'Rabi', priceRange: [1200, 2500], unit: 'quintal', image: '/images/crops/onions.png' },
    { name: 'Potatoes', category: 'Vegetables', season: 'Rabi', priceRange: [800, 1500], unit: 'quintal', image: '/images/crops/potatoes.png' },
    { name: 'Cabbage', category: 'Vegetables', season: 'Rabi', priceRange: [1000, 1800], unit: 'quintal', image: '/images/crops/cabbage.png' },
    { name: 'Cauliflower', category: 'Vegetables', season: 'Rabi', priceRange: [1200, 2000], unit: 'quintal', image: '/images/crops/cauliflower.png' },
    { name: 'Carrots', category: 'Vegetables', season: 'Rabi', priceRange: [1500, 2500], unit: 'quintal', image: '/images/crops/carrots.png' },
    { name: 'Brinjal', category: 'Vegetables', season: 'Year-Round', priceRange: [1800, 3000], unit: 'quintal', image: '/images/crops/brinjal.png' },
    { name: 'Okra', category: 'Vegetables', season: 'Kharif', priceRange: [2000, 3500], unit: 'quintal', image: '/images/crops/okra.png' },
    { name: 'Cucumber', category: 'Vegetables', season: 'Zaid', priceRange: [1500, 2500], unit: 'quintal', image: '/images/crops/cucumber.png' },
    { name: 'Pumpkin', category: 'Vegetables', season: 'Kharif', priceRange: [800, 1500], unit: 'quintal', image: '/images/crops/pumpkin.png' },
    { name: 'Bananas', category: 'Fruits', season: 'Year-Round', priceRange: [2000, 3500], unit: 'quintal', image: '/images/crops/bananas.png' },
    { name: 'Mangoes', category: 'Fruits', season: 'Zaid', priceRange: [3000, 5000], unit: 'quintal', image: '/images/crops/mangoes.png' },
    { name: 'Apples', category: 'Fruits', season: 'Rabi', priceRange: [5000, 8000], unit: 'quintal', image: '/images/crops/apple.png' },
    { name: 'Grapes', category: 'Fruits', season: 'Rabi', priceRange: [4000, 6500], unit: 'quintal', image: '/images/crops/grapes.png' },
    { name: 'Oranges', category: 'Fruits', season: 'Rabi', priceRange: [2500, 4000], unit: 'quintal', image: '/images/crops/oranges.png' },
    { name: 'Papayas', category: 'Fruits', season: 'Year-Round', priceRange: [1500, 2500], unit: 'quintal', image: '/images/crops/papayas.png' },
    { name: 'Watermelon', category: 'Fruits', season: 'Zaid', priceRange: [800, 1500], unit: 'quintal', image: '/images/crops/watermelon.png' },
    { name: 'Guava', category: 'Fruits', season: 'Year-Round', priceRange: [2000, 3000], unit: 'quintal', image: '/images/crops/guava.png' },
    { name: 'Turmeric', category: 'Spices', season: 'Kharif', priceRange: [6000, 9000], unit: 'quintal', image: '/images/crops/turmeric.png' },
    { name: 'Chilli', category: 'Spices', season: 'Kharif', priceRange: [8000, 12000], unit: 'quintal', image: '/images/crops/chilli.png' },
    { name: 'Coriander', category: 'Spices', season: 'Rabi', priceRange: [5000, 7000], unit: 'quintal', image: '/images/crops/coriander.png' },
    { name: 'Cumin', category: 'Spices', season: 'Rabi', priceRange: [15000, 20000], unit: 'quintal', image: '/images/crops/cumin.png' },
    { name: 'Ginger', category: 'Spices', season: 'Kharif', priceRange: [4000, 6000], unit: 'quintal', image: '/images/crops/ginger.jpg' },
    { name: 'Garlic', category: 'Spices', season: 'Rabi', priceRange: [3500, 5500], unit: 'quintal', image: '/images/crops/garlic.jpg' },
];

const indianStates = ['Punjab', 'Haryana', 'Uttar Pradesh', 'Bihar', 'West Bengal', 'Maharashtra', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'Kerala'];
const districts = {
    'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar'],
    'Haryana': ['Karnal', 'Hisar', 'Rohtak'],
    'Uttar Pradesh': ['Meerut', 'Agra', 'Lucknow'],
    'Maharashtra': ['Pune', 'Nashik', 'Nagpur'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara'],
    'Karnataka': ['Bangalore', 'Mysore', 'Hubli'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai'],
    'Kerala': ['Kochi', 'Thiruvananthapuram', 'Kozhikode'],
    'Bihar': ['Patna', 'Gaya', 'Bhagalpur'],
    'West Bengal': ['Kolkata', 'Howrah', 'Durgapur'],
};

const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomPrice = (priceRange) => getRandomInRange(priceRange[0], priceRange[1]);

async function seed5000Products() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        console.log('🗑️  Clearing existing crops...');
        await Crop.deleteMany({});
        console.log('✅ Cleared all existing crops\n');

        const farmers = await User.find({ role: 'farmer' });
        if (farmers.length === 0) {
            console.log('❌ No farmers found. Create farmers first!');
            process.exit(1);
        }

        console.log(`📊 Found ${farmers.length} farmers`);
        console.log('🌾 Creating 5000 products...\n');

        const crops = [];
        for (let i = 0; i < 5000; i++) {
            const template = getRandomItem(cropTemplates);
            const state = getRandomItem(indianStates);
            const district = getRandomItem(districts[state]);
            const farmer = getRandomItem(farmers);

            crops.push({
                name: template.name,
                category: template.category,
                season: template.season,
                expectedPrice: getRandomPrice(template.priceRange),
                quantity: {
                    value: getRandomInRange(10, 500),
                    unit: template.unit
                },
                qualityGrade: getRandomItem(['Premium', 'Grade A', 'Grade B', 'Standard']),
                description: `Premium quality ${template.name} from ${district}, ${state}. Freshly harvested and ready for wholesale.`,
                location: {
                    region: state,
                    state: state,
                    district: district,
                },
                images: [template.image],
                farmer: farmer._id,
                status: 'approved',
                organicCertified: Math.random() > 0.7,
                harvestDate: new Date(Date.now() - getRandomInRange(1, 30) * 24 * 60 * 60 * 1000),
                availableFrom: new Date(),
                availableUntil: new Date(Date.now() + getRandomInRange(30, 90) * 24 * 60 * 60 * 1000),
                availableForConsumers: true,
                consumerPrice: getRandomPrice(template.priceRange) * 1.2,
                stockQuantity: getRandomInRange(50, 1000),
                minOrderQuantity: {
                    value: template.unit === 'ton' ? 100 : 1,
                    unit: 'kg'
                },
                deliveryOptions: {
                    homeDelivery: Math.random() > 0.3,
                    pickupAvailable: true,
                    deliveryCharge: getRandomInRange(0, 100)
                }
            });

            if ((i + 1) % 1000 === 0) {
                console.log(`   Created ${i + 1} products...`);
            }
        }

        await Crop.insertMany(crops);
        console.log(`\n✅ Successfully created 5000 products!`);

        const count = await Crop.countDocuments();
        console.log(`📊 Total products in database: ${count}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

seed5000Products();
