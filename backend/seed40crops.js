import mongoose from 'mongoose';
import User from './models/User.js';
import Crop from './models/Crop.js';
import dotenv from 'dotenv';

dotenv.config();

// 40 Unique crop items with distinct data
const cropData = [
    // Cereals (8 items)
    { name: 'Basmati Rice', category: 'Cereals', season: 'Kharif', priceRange: [3500, 4500], unit: 'quintal', image: '/images/crops/paddy.png' },
    { name: 'Wheat Premium', category: 'Cereals', season: 'Rabi', priceRange: [2200, 2800], unit: 'quintal', image: '/images/crops/wheat.png' },
    { name: 'Sweet Corn', category: 'Cereals', season: 'Kharif', priceRange: [1800, 2600], unit: 'quintal', image: '/images/crops/maize.png' },
    { name: 'Pearl Barley', category: 'Cereals', season: 'Rabi', priceRange: [1900, 2500], unit: 'quintal', image: '/images/crops/barley.jpg' },
    { name: 'Finger Millet', category: 'Cereals', season: 'Kharif', priceRange: [2800, 3800], unit: 'quintal', image: '/images/crops/millets.png' },
    { name: 'Sorghum', category: 'Cereals', season: 'Kharif', priceRange: [2000, 2800], unit: 'quintal', image: '/images/crops/millets.png' },
    { name: 'Oats', category: 'Cereals', season: 'Rabi', priceRange: [2500, 3200], unit: 'quintal', image: '/images/crops/wheat.png' },
    { name: 'Brown Rice', category: 'Cereals', season: 'Kharif', priceRange: [3200, 4000], unit: 'quintal', image: '/images/crops/paddy.png' },

    // Pulses (6 items)
    { name: 'Kabuli Chickpeas', category: 'Pulses', season: 'Rabi', priceRange: [6000, 8000], unit: 'quintal', image: '/images/crops/chickpeas.jpg' },
    { name: 'Masoor Dal', category: 'Pulses', season: 'Rabi', priceRange: [6500, 8500], unit: 'quintal', image: '/images/crops/lentils.png' },
    { name: 'Moong Dal', category: 'Pulses', season: 'Kharif', priceRange: [7000, 9000], unit: 'quintal', image: '/images/crops/greengram.jpg' },
    { name: 'Urad Dal', category: 'Pulses', season: 'Kharif', priceRange: [7500, 9500], unit: 'quintal', image: '/images/crops/blackgram.jpg' },
    { name: 'Toor Dal', category: 'Pulses', season: 'Kharif', priceRange: [6800, 8800], unit: 'quintal', image: '/images/crops/pigeonpea.jpg' },
    { name: 'Kidney Beans', category: 'Pulses', season: 'Rabi', priceRange: [7000, 9500], unit: 'quintal', image: '/images/crops/lentils.png' },

    // Vegetables (8 items)
    { name: 'Cherry Tomatoes', category: 'Vegetables', season: 'Zaid', priceRange: [2000, 4000], unit: 'quintal', image: '/images/crops/tomatoes.png' },
    { name: 'Red Onions', category: 'Vegetables', season: 'Rabi', priceRange: [1500, 3000], unit: 'quintal', image: '/images/crops/onions.png' },
    { name: 'Sweet Potatoes', category: 'Vegetables', season: 'Rabi', priceRange: [1200, 2000], unit: 'quintal', image: '/images/crops/potatoes.png' },
    { name: 'Chinese Cabbage', category: 'Vegetables', season: 'Rabi', priceRange: [1300, 2200], unit: 'quintal', image: '/images/crops/cabbage.png' },
    { name: 'Broccoli', category: 'Vegetables', season: 'Rabi', priceRange: [1800, 2800], unit: 'quintal', image: '/images/crops/cauliflower.png' },
    { name: 'Baby Carrots', category: 'Vegetables', season: 'Rabi', priceRange: [2000, 3000], unit: 'quintal', image: '/images/crops/carrots.png' },
    { name: 'Bell Peppers', category: 'Vegetables', season: 'Year-Round', priceRange: [2500, 4000], unit: 'quintal', image: '/images/crops/brinjal.png' },
    { name: 'Zucchini', category: 'Vegetables', season: 'Zaid', priceRange: [1800, 3000], unit: 'quintal', image: '/images/crops/cucumber.png' },

    // Fruits (8 items)
    { name: 'Alphonso Mangoes', category: 'Fruits', season: 'Zaid', priceRange: [5000, 8000], unit: 'quintal', image: '/images/crops/mangoes.png' },
    { name: 'Cavendish Bananas', category: 'Fruits', season: 'Year-Round', priceRange: [2500, 4000], unit: 'quintal', image: '/images/crops/bananas.png' },
    { name: 'Red Delicious Apples', category: 'Fruits', season: 'Rabi', priceRange: [6000, 9000], unit: 'quintal', image: '/images/crops/apple.png' },
    { name: 'Green Grapes', category: 'Fruits', season: 'Rabi', priceRange: [4500, 7000], unit: 'quintal', image: '/images/crops/grapes.png' },
    { name: 'Valencia Oranges', category: 'Fruits', season: 'Rabi', priceRange: [3000, 4500], unit: 'quintal', image: '/images/crops/oranges.png' },
    { name: 'Red Lady Papaya', category: 'Fruits', season: 'Year-Round', priceRange: [2000, 3000], unit: 'quintal', image: '/images/crops/papayas.png' },
    { name: 'Sugar Baby Watermelon', category: 'Fruits', season: 'Zaid', priceRange: [1200, 2000], unit: 'quintal', image: '/images/crops/watermelon.png' },
    { name: 'Pink Guava', category: 'Fruits', season: 'Year-Round', priceRange: [2500, 3500], unit: 'quintal', image: '/images/crops/guava.png' },

    // Oilseeds (4 items)
    { name: 'Virginia Groundnut', category: 'Oilseeds', season: 'Kharif', priceRange: [5000, 6500], unit: 'quintal', image: '/images/crops/groundnut.png' },
    { name: 'Yellow Mustard', category: 'Oilseeds', season: 'Rabi', priceRange: [4500, 6000], unit: 'quintal', image: '/images/crops/mustard.png' },
    { name: 'Hybrid Sunflower', category: 'Oilseeds', season: 'Kharif', priceRange: [4800, 6500], unit: 'quintal', image: '/images/crops/sunflower.png' },
    { name: 'Black Soybean', category: 'Oilseeds', season: 'Kharif', priceRange: [4000, 5500], unit: 'quintal', image: '/images/crops/soybean.png' },

    // Spices (4 items)
    { name: 'Organic Turmeric', category: 'Spices', season: 'Kharif', priceRange: [7000, 10000], unit: 'quintal', image: '/images/crops/turmeric.png' },
    { name: 'Red Kashmiri Chilli', category: 'Spices', season: 'Kharif', priceRange: [10000, 14000], unit: 'quintal', image: '/images/crops/chilli.png' },
    { name: 'Fresh Coriander', category: 'Spices', season: 'Rabi', priceRange: [6000, 8000], unit: 'quintal', image: '/images/crops/coriander.png' },
    { name: 'Ginger Root', category: 'Spices', season: 'Kharif', priceRange: [4500, 6500], unit: 'quintal', image: '/images/crops/ginger.jpg' },

    // Cash Crops (2 items)
    { name: 'Organic Cotton', category: 'Cash Crops', season: 'Kharif', priceRange: [5000, 6500], unit: 'quintal', image: '/images/crops/cotton.png' },
    { name: 'Co-86032 Sugarcane', category: 'Cash Crops', season: 'Year-Round', priceRange: [3000, 4200], unit: 'ton', image: '/images/crops/sugarcane.png' },
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

async function seed40Crops() {
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
        console.log('🌾 Creating 40 unique crops...\n');

        const crops = [];
        for (let i = 0; i < cropData.length; i++) {
            const template = cropData[i];
            const state = getRandomItem(indianStates);
            const district = getRandomItem(districts[state]);
            const farmer = getRandomItem(farmers);

            const expectedPrice = getRandomPrice(template.priceRange);
            const consumerPrice = Math.round(expectedPrice * 1.25); // 25% markup

            crops.push({
                name: template.name,
                category: template.category,
                season: template.season,
                expectedPrice: expectedPrice,
                quantity: {
                    value: getRandomInRange(20, 500),
                    unit: template.unit
                },
                qualityGrade: getRandomItem(['Premium', 'Grade A', 'Grade B']),
                description: `Premium quality ${template.name} from ${district}, ${state}. Freshly harvested and certified.`,
                location: {
                    region: state,
                    state: state,
                    district: district,
                },
                images: [template.image],
                farmer: farmer._id,
                status: 'approved',
                organicCertified: Math.random() > 0.6,
                harvestDate: new Date(Date.now() - getRandomInRange(1, 25) * 24 * 60 * 60 * 1000),
                availableFrom: new Date(),
                availableUntil: new Date(Date.now() + getRandomInRange(40, 100) * 24 * 60 * 60 * 1000),
                availableForConsumers: true,
                consumerPrice: consumerPrice,
                stockQuantity: getRandomInRange(100, 1000),
                minOrderQuantity: {
                    value: template.unit === 'ton' ? 100 : 1,
                    unit: 'kg'
                },
                deliveryOptions: {
                    homeDelivery: Math.random() > 0.2,
                    pickupAvailable: true,
                    deliveryCharge: getRandomInRange(40, 120)
                }
            });
        }

        await Crop.insertMany(crops);
        console.log(`\n✅ Successfully created 40 unique crops!`);

        const count = await Crop.countDocuments();
        console.log(`📊 Total products in database: ${count}`);

        // Show breakdown by category
        console.log('\n📈 Breakdown by category:');
        const categories = {};
        crops.forEach(crop => {
            categories[crop.category] = (categories[crop.category] || 0) + 1;
        });
        Object.entries(categories).forEach(([category, count]) => {
            console.log(`   ${category}: ${count} crops`);
        });

        console.log('\n🎉 Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

seed40Crops();
