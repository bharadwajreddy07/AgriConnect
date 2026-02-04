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
    if (price === undefined || price === null || isNaN(price)) return '₹0';
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

// Crop Images (Wikipedia/Wikimedia Commons)
export const cropImages = {
    // Cereals
    'Rice': '/images/crops/paddy.png',
    'Paddy': '/images/crops/paddy.png',
    'Wheat': '/images/crops/wheat.png',
    'Maize': '/images/crops/maize.png',
    'Bajra': '/images/crops/millets.png',
    'Jowar': '/images/crops/millets.png',
    'Barley': '/images/crops/barley.png',
    'Ragi': '/images/crops/millets.png',
    'Millets': '/images/crops/millets.png',

    // Pulses
    'Lentil': '/images/crops/lentils.png',
    'Lentils': '/images/crops/lentils.png',
    'Gram': '/images/crops/chickpeas.png',
    'Chickpeas': '/images/crops/chickpeas.png',
    'Peas': '/images/crops/lentils.png',
    'Arhar': '/images/crops/pigeonpea.png',
    'Pigeon Pea': '/images/crops/pigeonpea.png',
    'Moong': '/images/crops/greengram.png',
    'Green Gram': '/images/crops/greengram.png',
    'Urad': '/images/crops/blackgram.png',
    'Black Gram': '/images/crops/blackgram.png',

    // Vegetables
    'Tomato': '/images/crops/tomatoes.png',
    'Tomatoes': '/images/crops/tomatoes.png',
    'Potato': '/images/crops/potatoes.png',
    'Potatoes': '/images/crops/potatoes.png',
    'Onion': '/images/crops/onions.png',
    'Onions': '/images/crops/onions.png',
    'Cabbage': '/images/crops/cabbage.png',
    'Cauliflower': '/images/crops/cauliflower.png',
    'Brinjal': '/images/crops/brinjal.png',
    'Cucumber': '/images/crops/cucumber.png',
    'Okra': '/images/crops/okra.png',
    'Lady Finger': '/images/crops/okra.png',
    'Carrot': '/images/crops/carrots.png',
    'Carrots': '/images/crops/carrots.png',
    'Pumpkin': '/images/crops/pumpkin.png',
    'Vegetables': '/images/crops/cabbage.png',

    // Fruits
    'Mango': '/images/crops/mangoes.png',
    'Mangoes': '/images/crops/mangoes.png',
    'Banana': '/images/crops/bananas.png',
    'Bananas': '/images/crops/bananas.png',
    'Grapes': '/images/crops/grapes.png',
    'Apple': '/images/crops/apple.png',
    'Apples': '/images/crops/apple.png',
    'Orange': '/images/crops/oranges.png',
    'Oranges': '/images/crops/oranges.png',
    'Watermelon': '/images/crops/watermelon.png',
    'Papaya': '/images/crops/papayas.png',
    'Papayas': '/images/crops/papayas.png',
    'Guava': '/images/crops/guava.png',

    // Spices
    'Turmeric': '/images/crops/turmeric.png',
    'Chilli': '/images/crops/chilli.png',
    'Chillies': '/images/crops/chilli.png',
    'Ginger': '/images/crops/ginger.png',
    'Garlic': '/images/crops/garlic.png',
    'Cumin': '/images/crops/cumin.png',
    'Coriander': '/images/crops/coriander.png',
    'Mustard': '/images/crops/mustard.png',

    // Oilseeds
    'Groundnut': '/images/crops/groundnut.png',
    'Sunflower': '/images/crops/sunflower.png',
    'Soybean': '/images/crops/soybean.png',
    'Sesame': '/images/crops/sesame.png',

    // Others
    'Sugarcane': '/images/crops/sugarcane.png',
    'Cotton': '/images/crops/cotton.png',
    'Jute': '/images/crops/jute.png',
};

// Get crop image by name
export const getCropImage = (cropName) => {
    if (!cropName) return 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80';

    const normalizedName = cropName.toLowerCase();

    // 1. Try exact or case-insensitive match
    const matchedKey = Object.keys(cropImages).find(
        key => key.toLowerCase() === normalizedName
    );
    if (matchedKey) return cropImages[matchedKey];

    // 2. Try partial match (if cropName contains any key from cropImages)
    // We sort keys by length descending to match the most specific term first
    const sortedKeys = Object.keys(cropImages).sort((a, b) => b.length - a.length);
    const partialMatch = sortedKeys.find(key => normalizedName.includes(key.toLowerCase()));
    if (partialMatch) return cropImages[partialMatch];

    // 3. Try splitting and matching words
    const words = normalizedName.split(/\s+/);
    for (const word of words) {
        if (word.length < 3) continue; // Skip short words like "of", "and"
        const wordMatch = sortedKeys.find(key => key.toLowerCase() === word);
        if (wordMatch) return cropImages[wordMatch];
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
