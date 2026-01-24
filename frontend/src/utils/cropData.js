// Indian States
export const indianStates = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
];

// Crop Seasons
export const seasons = ['Kharif', 'Rabi', 'Zaid', 'Year-Round'];

// Crop Categories
export const cropCategories = [
    'Cereals',
    'Pulses',
    'Oilseeds',
    'Vegetables',
    'Fruits',
    'Spices',
    'Cash Crops',
    'Fiber Crops',
];

// Kharif Crops (June - October)
export const kharifCrops = {
    'Andhra Pradesh': ['Rice', 'Cotton', 'Groundnut', 'Maize'],
    'Telangana': ['Rice', 'Cotton', 'Maize', 'Soybean'],
    'Maharashtra': ['Cotton', 'Soybean', 'Sugarcane', 'Bajra'],
    'Gujarat': ['Cotton', 'Groundnut', 'Bajra'],
    'Punjab': ['Rice', 'Maize', 'Cotton'],
    'Haryana': ['Rice', 'Cotton', 'Bajra'],
    'Uttar Pradesh': ['Rice', 'Sugarcane', 'Maize'],
    'West Bengal': ['Rice', 'Jute'],
    'Karnataka': ['Maize', 'Ragi', 'Cotton'],
    'Madhya Pradesh': ['Soybean', 'Cotton', 'Maize'],
    'Tamil Nadu': ['Rice', 'Cotton', 'Groundnut'],
    'Rajasthan': ['Bajra', 'Maize', 'Cotton'],
};

// Rabi Crops (October - March)
export const rabiCrops = {
    'Punjab': ['Wheat', 'Barley', 'Mustard'],
    'Haryana': ['Wheat', 'Barley', 'Mustard'],
    'Uttar Pradesh': ['Wheat', 'Barley', 'Peas', 'Mustard'],
    'Madhya Pradesh': ['Wheat', 'Gram', 'Lentils'],
    'Maharashtra': ['Wheat', 'Gram', 'Jowar'],
    'Rajasthan': ['Wheat', 'Barley', 'Mustard', 'Gram'],
    'Gujarat': ['Wheat', 'Gram', 'Tobacco'],
    'Bihar': ['Wheat', 'Barley', 'Lentils'],
    'West Bengal': ['Wheat', 'Barley', 'Peas'],
};

// Zaid Crops (March - June)
export const zaidCrops = {
    'Uttar Pradesh': ['Watermelon', 'Muskmelon', 'Cucumber', 'Summer Maize'],
    'Bihar': ['Watermelon', 'Cucumber', 'Vegetables'],
    'Punjab': ['Watermelon', 'Muskmelon', 'Vegetables'],
    'Haryana': ['Watermelon', 'Muskmelon', 'Vegetables'],
    'Maharashtra': ['Watermelon', 'Vegetables'],
    'Karnataka': ['Summer Maize', 'Vegetables'],
    'Andhra Pradesh': ['Summer Maize', 'Vegetables'],
};

// Famous Crops by State
export const famousCropsByState = {
    'Andhra Pradesh': ['Rice', 'Cotton', 'Chillies', 'Groundnut', 'Turmeric'],
    'Telangana': ['Rice', 'Cotton', 'Maize', 'Turmeric'],
    'Maharashtra': ['Cotton', 'Soybean', 'Sugarcane', 'Onion', 'Grapes'],
    'Punjab': ['Wheat', 'Rice', 'Maize', 'Mustard'],
    'Haryana': ['Wheat', 'Rice', 'Sugarcane', 'Cotton'],
    'Tamil Nadu': ['Rice', 'Banana', 'Coconut', 'Tapioca'],
    'Karnataka': ['Coffee', 'Maize', 'Ragi', 'Arecanut'],
    'Kerala': ['Coconut', 'Rubber', 'Spices', 'Tea', 'Coffee'],
    'Gujarat': ['Cotton', 'Groundnut', 'Tobacco', 'Wheat'],
    'West Bengal': ['Rice', 'Jute', 'Tea'],
    'Uttar Pradesh': ['Wheat', 'Sugarcane', 'Rice', 'Potatoes'],
    'Madhya Pradesh': ['Wheat', 'Soybean', 'Gram', 'Cotton'],
    'Rajasthan': ['Bajra', 'Wheat', 'Mustard', 'Barley'],
    'Bihar': ['Rice', 'Wheat', 'Maize', 'Sugarcane'],
};

// Quality Grades
export const qualityGrades = ['Premium', 'Grade A', 'Grade B', 'Standard'];

// Units
export const units = ['kg', 'quintal', 'ton', 'piece'];

// Order Status
export const orderStatuses = [
    'placed',
    'confirmed',
    'processing',
    'packed',
    'shipped',
    'out_for_delivery',
    'delivered',
    'cancelled',
    'returned',
];

// Payment Methods
export const paymentMethods = [
    { value: 'cod', label: 'Cash on Delivery' },
    { value: 'online', label: 'Online Payment' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
];

// Get season badge class
export const getSeasonBadgeClass = (season) => {
    const seasonMap = {
        'Kharif': 'season-kharif',
        'Rabi': 'season-rabi',
        'Zaid': 'season-zaid',
        'Year-Round': 'badge-info',
    };
    return seasonMap[season] || 'badge-primary';
};

// Get status badge class
export const getStatusBadgeClass = (status) => {
    const statusMap = {
        'pending': 'status-pending',
        'approved': 'status-approved',
        'active': 'status-approved',
        'rejected': 'status-rejected',
        'ongoing': 'status-ongoing',
        'accepted': 'status-approved',
        'delivered': 'status-approved',
        'cancelled': 'status-rejected',
    };
    return statusMap[status] || 'badge-info';
};

// Format price in INR
export const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(price);
};

// Format date
export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

// Format date with time
export const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// Crop Image Mappings - High quality stock photos
export const cropImages = {
    // Cereals
    'Rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
    'Paddy': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
    'Wheat': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80',
    'Maize': 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=800&q=80',
    'Bajra': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80',
    'Jowar': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80',
    'Barley': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80',
    'Ragi': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80',

    // Pulses
    'Gram': 'https://images.unsplash.com/photo-1610988924854-e3c2f8c4d9a2?w=800&q=80',
    'Lentils': 'https://images.unsplash.com/photo-1610988924854-e3c2f8c4d9a2?w=800&q=80',
    'Peas': 'https://images.unsplash.com/photo-1588165171080-c89acfa5ee83?w=800&q=80',
    'Arhar': 'https://images.unsplash.com/photo-1610988924854-e3c2f8c4d9a2?w=800&q=80',
    'Moong': 'https://images.unsplash.com/photo-1610988924854-e3c2f8c4d9a2?w=800&q=80',
    'Urad': 'https://images.unsplash.com/photo-1610988924854-e3c2f8c4d9a2?w=800&q=80',

    // Cash Crops
    'Cotton': 'https://images.unsplash.com/photo-1615485500834-bc10199bc727?w=800&q=80',
    'Sugarcane': 'https://images.unsplash.com/photo-1583484963886-cfe2a9a8c3ce?w=800&q=80',
    'Jute': 'https://images.unsplash.com/photo-1615485500834-bc10199bc727?w=800&q=80',
    'Tobacco': 'https://images.unsplash.com/photo-1615485500834-bc10199bc727?w=800&q=80',

    // Oilseeds
    'Groundnut': 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=800&q=80',
    'Mustard': 'https://images.unsplash.com/photo-1615485500834-bc10199bc727?w=800&q=80',
    'Soybean': 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=800&q=80',
    'Sunflower': 'https://images.unsplash.com/photo-1597848212624-e530bb4fe5e2?w=800&q=80',

    // Vegetables
    'Tomato': 'https://images.unsplash.com/photo-1546470427-227a4e2c2f0f?w=800&q=80',
    'Potato': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80',
    'Potatoes': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80',
    'Onion': 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&q=80',
    'Cabbage': 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=800&q=80',
    'Cauliflower': 'https://images.unsplash.com/photo-1568584711271-e0e4e9d5d4a1?w=800&q=80',
    'Brinjal': 'https://images.unsplash.com/photo-1659261200833-ec8761558af7?w=800&q=80',
    'Cucumber': 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=800&q=80',
    'Vegetables': 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=800&q=80',

    // Fruits
    'Mango': 'https://images.unsplash.com/photo-1605027990121-cbae9d3ce6fa?w=800&q=80',
    'Banana': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&q=80',
    'Grapes': 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=800&q=80',
    'Apple': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&q=80',
    'Orange': 'https://images.unsplash.com/photo-1547514701-42782101795e?w=800&q=80',
    'Watermelon': 'https://images.unsplash.com/photo-1587049352846-4a222e784720?w=800&q=80',
    'Muskmelon': 'https://images.unsplash.com/photo-1621583832862-f5a7c5f2f0b3?w=800&q=80',

    // Spices
    'Turmeric': 'https://images.unsplash.com/photo-1615485500834-bc10199bc727?w=800&q=80',
    'Chillies': 'https://images.unsplash.com/photo-1583454155184-870a1f63eeac?w=800&q=80',
    'Chilli': 'https://images.unsplash.com/photo-1583454155184-870a1f63eeac?w=800&q=80',
    'Ginger': 'https://images.unsplash.com/photo-1615485500834-bc10199bc727?w=800&q=80',
    'Garlic': 'https://images.unsplash.com/photo-1615485500834-bc10199bc727?w=800&q=80',

    // Others
    'Coffee': 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80',
    'Tea': 'https://images.unsplash.com/photo-1597318112874-f1cdcf8c3f2e?w=800&q=80',
    'Coconut': 'https://images.unsplash.com/photo-1598511757337-fe2cafc31ba0?w=800&q=80',
    'Rubber': 'https://images.unsplash.com/photo-1615485500834-bc10199bc727?w=800&q=80',
    'Arecanut': 'https://images.unsplash.com/photo-1615485500834-bc10199bc727?w=800&q=80',
    'Tapioca': 'https://images.unsplash.com/photo-1615485500834-bc10199bc727?w=800&q=80',

    // Summer crops
    'Summer Maize': 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=800&q=80',
};

// Get crop image by name
export const getCropImage = (cropName) => {
    if (!cropName) return 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80';

    // Try exact match first
    if (cropImages[cropName]) {
        return cropImages[cropName];
    }

    // Try case-insensitive match
    const normalizedName = cropName.toLowerCase();
    const matchedKey = Object.keys(cropImages).find(
        key => key.toLowerCase() === normalizedName
    );

    if (matchedKey) {
        return cropImages[matchedKey];
    }

    // Default fallback image
    return 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80';
};

// Get relative time (e.g., "2 hours ago")
export const getRelativeTime = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return formatDate(date);
};
