import mongoose from 'mongoose';
import User from './models/User.js';
import Crop from './models/Crop.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Comprehensive crop templates - 100+ varieties excluding Spices and Brinjal
const cropTemplates = [
    // ===== CEREALS (15 varieties) =====
    { name: 'Basmati Rice', category: 'Cereals', season: 'Kharif', priceRange: [4000, 5500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80' },
    { name: 'Sona Masoori Rice', category: 'Cereals', season: 'Kharif', priceRange: [3000, 4200], unit: 'quintal', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80' },
    { name: 'Brown Rice', category: 'Cereals', season: 'Kharif', priceRange: [3500, 4800], unit: 'quintal', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80' },
    { name: 'Wheat', category: 'Cereals', season: 'Rabi', priceRange: [1800, 2500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80' },
    { name: 'Durum Wheat', category: 'Cereals', season: 'Rabi', priceRange: [2200, 3000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80' },
    { name: 'Sweet Corn', category: 'Cereals', season: 'Kharif', priceRange: [1500, 2200], unit: 'quintal', image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&q=80' },
    { name: 'Baby Corn', category: 'Cereals', season: 'Kharif', priceRange: [2500, 3500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&q=80' },
    { name: 'Barley', category: 'Cereals', season: 'Rabi', priceRange: [1600, 2300], unit: 'quintal', image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&q=80' },
    { name: 'Pearl Millet', category: 'Cereals', season: 'Kharif', priceRange: [2000, 2800], unit: 'quintal', image: 'https://images.unsplash.com/photo-1599909533730-f9d7e4c2f5b5?w=800&q=80' },
    { name: 'Finger Millet', category: 'Cereals', season: 'Kharif', priceRange: [2500, 3500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1599909533730-f9d7e4c2f5b5?w=800&q=80' },
    { name: 'Foxtail Millet', category: 'Cereals', season: 'Kharif', priceRange: [2800, 3800], unit: 'quintal', image: 'https://images.unsplash.com/photo-1599909533730-f9d7e4c2f5b5?w=800&q=80' },
    { name: 'Sorghum', category: 'Cereals', season: 'Kharif', priceRange: [1800, 2600], unit: 'quintal', image: 'https://images.unsplash.com/photo-1599909533730-f9d7e4c2f5b5?w=800&q=80' },
    { name: 'Oats', category: 'Cereals', season: 'Rabi', priceRange: [2200, 3200], unit: 'quintal', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80' },
    { name: 'Rye', category: 'Cereals', season: 'Rabi', priceRange: [2000, 2800], unit: 'quintal', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80' },
    { name: 'Quinoa', category: 'Cereals', season: 'Rabi', priceRange: [8000, 12000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80' },

    // ===== PULSES (15 varieties) =====
    { name: 'Chickpeas (Kabuli)', category: 'Pulses', season: 'Rabi', priceRange: [5500, 7500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1610440042657-612c396ff084?w=800&q=80' },
    { name: 'Chickpeas (Desi)', category: 'Pulses', season: 'Rabi', priceRange: [5000, 7000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1610440042657-612c396ff084?w=800&q=80' },
    { name: 'Red Lentils', category: 'Pulses', season: 'Rabi', priceRange: [5500, 7500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80' },
    { name: 'Green Lentils', category: 'Pulses', season: 'Rabi', priceRange: [5800, 7800], unit: 'quintal', image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80' },
    { name: 'Yellow Lentils', category: 'Pulses', season: 'Rabi', priceRange: [5200, 7200], unit: 'quintal', image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80' },
    { name: 'Green Gram (Moong)', category: 'Pulses', season: 'Kharif', priceRange: [6000, 8000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1610440042657-612c396ff084?w=800&q=80' },
    { name: 'Black Gram (Urad)', category: 'Pulses', season: 'Kharif', priceRange: [6500, 8500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1610440042657-612c396ff084?w=800&q=80' },
    { name: 'Pigeon Pea (Toor)', category: 'Pulses', season: 'Kharif', priceRange: [5800, 7800], unit: 'quintal', image: 'https://images.unsplash.com/photo-1610440042657-612c396ff084?w=800&q=80' },
    { name: 'Kidney Beans (Rajma)', category: 'Pulses', season: 'Rabi', priceRange: [7000, 9000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1610440042657-612c396ff084?w=800&q=80' },
    { name: 'White Peas', category: 'Pulses', season: 'Rabi', priceRange: [4500, 6000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1588159477650-ff6291dd4420?w=800&q=80' },
    { name: 'Green Peas', category: 'Pulses', season: 'Rabi', priceRange: [3000, 4500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1588159477650-ff6291dd4420?w=800&q=80' },
    { name: 'Black Eyed Peas', category: 'Pulses', season: 'Kharif', priceRange: [5500, 7000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1610440042657-612c396ff084?w=800&q=80' },
    { name: 'Soybeans', category: 'Pulses', season: 'Kharif', priceRange: [3500, 4800], unit: 'quintal', image: 'https://images.unsplash.com/photo-1615485925694-a0319ca73041?w=800&q=80' },
    { name: 'Lima Beans', category: 'Pulses', season: 'Kharif', priceRange: [6000, 8000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1610440042657-612c396ff084?w=800&q=80' },
    { name: 'Navy Beans', category: 'Pulses', season: 'Rabi', priceRange: [6500, 8500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1610440042657-612c396ff084?w=800&q=80' },

    // ===== OILSEEDS (12 varieties) =====
    { name: 'Groundnut', category: 'Oilseeds', season: 'Kharif', priceRange: [4500, 6000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=800&q=80' },
    { name: 'Mustard', category: 'Oilseeds', season: 'Rabi', priceRange: [4000, 5500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80' },
    { name: 'Sunflower', category: 'Oilseeds', season: 'Kharif', priceRange: [4200, 5800], unit: 'quintal', image: 'https://images.unsplash.com/photo-1597848212624-e4c0e8b0a266?w=800&q=80' },
    { name: 'Sesame (White)', category: 'Oilseeds', season: 'Kharif', priceRange: [7000, 9000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=800&q=80' },
    { name: 'Sesame (Black)', category: 'Oilseeds', season: 'Kharif', priceRange: [7500, 9500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=800&q=80' },
    { name: 'Safflower', category: 'Oilseeds', season: 'Rabi', priceRange: [4500, 6500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1597848212624-e4c0e8b0a266?w=800&q=80' },
    { name: 'Linseed (Flax)', category: 'Oilseeds', season: 'Rabi', priceRange: [5000, 7000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80' },
    { name: 'Castor', category: 'Oilseeds', season: 'Kharif', priceRange: [4800, 6200], unit: 'quintal', image: 'https://images.unsplash.com/photo-1597848212624-e4c0e8b0a266?w=800&q=80' },
    { name: 'Niger Seed', category: 'Oilseeds', season: 'Kharif', priceRange: [6000, 8000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=800&q=80' },
    { name: 'Rapeseed', category: 'Oilseeds', season: 'Rabi', priceRange: [4200, 5800], unit: 'quintal', image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80' },
    { name: 'Coconut (Copra)', category: 'Oilseeds', season: 'Year-Round', priceRange: [8000, 11000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1589670680168-a523745b1c22?w=800&q=80' },
    { name: 'Palm Oil Seeds', category: 'Oilseeds', season: 'Year-Round', priceRange: [3500, 5000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800&q=80' },

    // ===== VEGETABLES (30 varieties) - NO BRINJAL =====
    { name: 'Tomatoes', category: 'Vegetables', season: 'Year-Round', priceRange: [1500, 3500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80' },
    { name: 'Cherry Tomatoes', category: 'Vegetables', season: 'Year-Round', priceRange: [3000, 5000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80' },
    { name: 'Red Onions', category: 'Vegetables', season: 'Rabi', priceRange: [1200, 2500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&q=80' },
    { name: 'White Onions', category: 'Vegetables', season: 'Rabi', priceRange: [1300, 2600], unit: 'quintal', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&q=80' },
    { name: 'Potatoes', category: 'Vegetables', season: 'Rabi', priceRange: [800, 1500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80' },
    { name: 'Sweet Potatoes', category: 'Vegetables', season: 'Kharif', priceRange: [1500, 2500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80' },
    { name: 'Cabbage', category: 'Vegetables', season: 'Rabi', priceRange: [1000, 1800], unit: 'quintal', image: 'https://images.unsplash.com/photo-1594282443392-25a2c0f4c074?w=800&q=80' },
    { name: 'Red Cabbage', category: 'Vegetables', season: 'Rabi', priceRange: [1500, 2500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1594282443392-25a2c0f4c074?w=800&q=80' },
    { name: 'Cauliflower', category: 'Vegetables', season: 'Rabi', priceRange: [1200, 2000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1568584711271-742a2ff6a6c0?w=800&q=80' },
    { name: 'Broccoli', category: 'Vegetables', season: 'Rabi', priceRange: [2500, 4000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=800&q=80' },
    { name: 'Carrots', category: 'Vegetables', season: 'Rabi', priceRange: [1500, 2500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&q=80' },
    { name: 'Radish', category: 'Vegetables', season: 'Rabi', priceRange: [800, 1500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&q=80' },
    { name: 'Beetroot', category: 'Vegetables', season: 'Rabi', priceRange: [1800, 2800], unit: 'quintal', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&q=80' },
    { name: 'Okra (Lady Finger)', category: 'Vegetables', season: 'Kharif', priceRange: [2000, 3500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1597305876245-c8c2025e5c0e?w=800&q=80' },
    { name: 'Cucumber', category: 'Vegetables', season: 'Zaid', priceRange: [1500, 2500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1604977042946-1eecc6a30d73?w=800&q=80' },
    { name: 'Bitter Gourd', category: 'Vegetables', season: 'Kharif', priceRange: [2000, 3500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1604977042946-1eecc6a30d73?w=800&q=80' },
    { name: 'Bottle Gourd', category: 'Vegetables', season: 'Kharif', priceRange: [1200, 2000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1604977042946-1eecc6a30d73?w=800&q=80' },
    { name: 'Pumpkin', category: 'Vegetables', season: 'Kharif', priceRange: [800, 1500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1506917728037-b6af011561e6?w=800&q=80' },
    { name: 'Zucchini', category: 'Vegetables', season: 'Year-Round', priceRange: [2500, 3800], unit: 'quintal', image: 'https://images.unsplash.com/photo-1604977042946-1eecc6a30d73?w=800&q=80' },
    { name: 'Bell Peppers (Green)', category: 'Vegetables', season: 'Year-Round', priceRange: [3000, 5000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&q=80' },
    { name: 'Bell Peppers (Red)', category: 'Vegetables', season: 'Year-Round', priceRange: [4000, 6000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&q=80' },
    { name: 'Green Beans', category: 'Vegetables', season: 'Year-Round', priceRange: [2500, 4000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1588159477650-ff6291dd4420?w=800&q=80' },
    { name: 'Spinach', category: 'Vegetables', season: 'Rabi', priceRange: [1500, 2500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&q=80' },
    { name: 'Lettuce', category: 'Vegetables', season: 'Rabi', priceRange: [2000, 3500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&q=80' },
    { name: 'Coriander Leaves', category: 'Vegetables', season: 'Year-Round', priceRange: [3000, 5000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80' },
    { name: 'Fenugreek Leaves', category: 'Vegetables', season: 'Rabi', priceRange: [2500, 4000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80' },
    { name: 'Drumstick', category: 'Vegetables', season: 'Year-Round', priceRange: [2000, 3500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1604977042946-1eecc6a30d73?w=800&q=80' },
    { name: 'Ridge Gourd', category: 'Vegetables', season: 'Kharif', priceRange: [1500, 2800], unit: 'quintal', image: 'https://images.unsplash.com/photo-1604977042946-1eecc6a30d73?w=800&q=80' },
    { name: 'Snake Gourd', category: 'Vegetables', season: 'Kharif', priceRange: [1500, 2500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1604977042946-1eecc6a30d73?w=800&q=80' },
    { name: 'Ash Gourd', category: 'Vegetables', season: 'Kharif', priceRange: [800, 1500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1604977042946-1eecc6a30d73?w=800&q=80' },

    // ===== FRUITS (25 varieties) =====
    { name: 'Alphonso Mangoes', category: 'Fruits', season: 'Zaid', priceRange: [8000, 12000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800&q=80' },
    { name: 'Kesar Mangoes', category: 'Fruits', season: 'Zaid', priceRange: [7000, 10000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800&q=80' },
    { name: 'Bananas', category: 'Fruits', season: 'Year-Round', priceRange: [2000, 3500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=800&q=80' },
    { name: 'Red Bananas', category: 'Fruits', season: 'Year-Round', priceRange: [2500, 4000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=800&q=80' },
    { name: 'Apples (Shimla)', category: 'Fruits', season: 'Rabi', priceRange: [5000, 8000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&q=80' },
    { name: 'Apples (Kashmir)', category: 'Fruits', season: 'Rabi', priceRange: [6000, 10000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&q=80' },
    { name: 'Green Grapes', category: 'Fruits', season: 'Rabi', priceRange: [4000, 6500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1537640538965-17562995e9bb?w=800&q=80' },
    { name: 'Black Grapes', category: 'Fruits', season: 'Rabi', priceRange: [4500, 7000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1537640538965-17562995e9bb?w=800&q=80' },
    { name: 'Oranges (Nagpur)', category: 'Fruits', season: 'Rabi', priceRange: [2500, 4000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=800&q=80' },
    { name: 'Sweet Lime (Mosambi)', category: 'Fruits', season: 'Rabi', priceRange: [2000, 3500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=800&q=80' },
    { name: 'Papayas', category: 'Fruits', season: 'Year-Round', priceRange: [1500, 2500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1617112848923-cc5c3ac3514c?w=800&q=80' },
    { name: 'Watermelon', category: 'Fruits', season: 'Zaid', priceRange: [800, 1500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&q=80' },
    { name: 'Muskmelon', category: 'Fruits', season: 'Zaid', priceRange: [1200, 2000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&q=80' },
    { name: 'Guava', category: 'Fruits', season: 'Year-Round', priceRange: [2000, 3000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1536968771144-884d635c7546?w=800&q=80' },
    { name: 'Pomegranate', category: 'Fruits', season: 'Year-Round', priceRange: [5000, 8000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80' },
    { name: 'Pineapple', category: 'Fruits', season: 'Year-Round', priceRange: [2500, 4000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1587883012610-e3df17d84fa2?w=800&q=80' },
    { name: 'Dragon Fruit', category: 'Fruits', season: 'Year-Round', priceRange: [8000, 12000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1527325678964-54921661f888?w=800&q=80' },
    { name: 'Kiwi', category: 'Fruits', season: 'Rabi', priceRange: [10000, 15000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1589865325520-7f7885d5f959?w=800&q=80' },
    { name: 'Strawberries', category: 'Fruits', season: 'Rabi', priceRange: [12000, 18000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&q=80' },
    { name: 'Blueberries', category: 'Fruits', season: 'Rabi', priceRange: [15000, 22000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=800&q=80' },
    { name: 'Litchi', category: 'Fruits', season: 'Zaid', priceRange: [6000, 9000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1596603158549-e040e9b56f5a?w=800&q=80' },
    { name: 'Custard Apple', category: 'Fruits', season: 'Kharif', priceRange: [4000, 6000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=800&q=80' },
    { name: 'Sapota (Chikoo)', category: 'Fruits', season: 'Year-Round', priceRange: [2500, 4000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1617112848923-cc5c3ac3514c?w=800&q=80' },
    { name: 'Jackfruit', category: 'Fruits', season: 'Zaid', priceRange: [1500, 2500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1505927408518-00af21061a2f?w=800&q=80' },
    { name: 'Coconuts', category: 'Fruits', season: 'Year-Round', priceRange: [2000, 3500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1589670680168-a523745b1c22?w=800&q=80' },

    // ===== CASH CROPS (8 varieties) =====
    { name: 'Cotton', category: 'Cash Crops', season: 'Kharif', priceRange: [4500, 6000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1602524206684-76b085e50196?w=800&q=80' },
    { name: 'Sugarcane', category: 'Cash Crops', season: 'Year-Round', priceRange: [2800, 3800], unit: 'ton', image: 'https://images.unsplash.com/photo-1524367363275-c27b6837f72f?w=800&q=80' },
    { name: 'Jute', category: 'Cash Crops', season: 'Kharif', priceRange: [3500, 4500], unit: 'quintal', image: 'https://images.unsplash.com/photo-1597848212624-e4c0e8b0a266?w=800&q=80' },
    { name: 'Tobacco', category: 'Cash Crops', season: 'Rabi', priceRange: [8000, 12000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1605013941746-f3d9e8e2da4c?w=800&q=80' },
    { name: 'Tea Leaves', category: 'Cash Crops', season: 'Year-Round', priceRange: [15000, 25000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80' },
    { name: 'Coffee Beans', category: 'Cash Crops', season: 'Year-Round', priceRange: [18000, 28000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80' },
    { name: 'Rubber', category: 'Cash Crops', season: 'Year-Round', priceRange: [12000, 18000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1597848212624-e4c0e8b0a266?w=800&q=80' },
    { name: 'Cashew Nuts', category: 'Cash Crops', season: 'Zaid', priceRange: [25000, 35000], unit: 'quintal', image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800&q=80' },
];

const indianStates = ['Punjab', 'Haryana', 'Uttar Pradesh', 'Bihar', 'West Bengal', 'Maharashtra', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'Kerala', 'Andhra Pradesh', 'Telangana', 'Rajasthan', 'Madhya Pradesh'];
const districts = {
    'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala'],
    'Haryana': ['Karnal', 'Hisar', 'Rohtak', 'Gurgaon'],
    'Uttar Pradesh': ['Meerut', 'Agra', 'Lucknow', 'Kanpur'],
    'Maharashtra': ['Pune', 'Nashik', 'Nagpur', 'Mumbai'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
    'Karnataka': ['Bangalore', 'Mysore', 'Belgaum', 'Mangalore'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem'],
    'Kerala': ['Kochi', 'Kozhikode', 'Thrissur', 'Trivandrum'],
    'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati'],
    'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'],
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
        console.log('🌱 Starting comprehensive database seeding...\n');

        // Step 0: Clear existing data
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Crop.deleteMany({});
        console.log('✅ Database cleared\n');

        // Step 1: Create sample farmers
        console.log('👨‍🌾 Creating sample farmers...');

        const farmerData = [
            { name: 'Kalyan', email: 'kalyan@farmer.com', phone: '9876543210', region: 'Andhra Pradesh' },
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
                password: 'password123',
                phone: data.phone,
                role: 'farmer',
                region: data.region,
                isVerified: true,
            });
            await farmer.save();
            farmers.push(farmer);
        }

        console.log(`✅ Created ${farmers.length} farmers\n`);

        // Step 2: Create 150+ crop instances from 105 templates
        console.log('🌾 Creating 150+ sample crops from 105+ templates...');
        const cropsToCreate = [];

        // Generate 150 crop instances (some templates will have multiple instances)
        for (let i = 0; i < 150; i++) {
            const template = getRandomItem(cropTemplates);
            const state = getRandomItem(indianStates);
            const district = getRandomItem(districts[state] || [state]);

            // Assign first 30 crops to the first farmer (Kalyan - Demo User)
            const farmer = i < 30 ? farmers[0] : getRandomItem(farmers);

            const expectedPrice = getRandomPrice(template.priceRange);
            // Consumer price in kg - convert from quintal price (1 quintal = 100 kg)
            // Add 20% markup for retail
            const consumerPricePerKg = Math.round((expectedPrice / 100) * 1.2);

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
                images: template.image ? [template.image] : [],
                farmer: farmer._id,
                status: 'approved',
                organicCertified: Math.random() > 0.7,
                harvestDate: new Date(Date.now() - getRandomInRange(1, 30) * 24 * 60 * 60 * 1000),
                availableFrom: new Date(),
                availableUntil: new Date(Date.now() + getRandomInRange(30, 90) * 24 * 60 * 60 * 1000),
                // Consumer marketplace fields
                availableForConsumers: true,
                consumerPrice: consumerPricePerKg,
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
        console.log(`\n📊 Total unique crop varieties: ${cropTemplates.length}`);
        console.log(`📦 Total crop instances: ${createdCrops.length}`);
        console.log('\n✅ NO Spices category included');
        console.log('✅ NO Brinjal included');
        console.log('✅ All crops available for consumers with kg pricing');
        console.log('\n📝 Sample farmer credentials:');
        console.log('   Email: kalyan@farmer.com');
        console.log('   Password: password123');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
