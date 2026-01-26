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
    'Rice': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Rice_Plants_%28IRRI%29.jpg/640px-Rice_Plants_%28IRRI%29.jpg',
    'Paddy': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Rice_Plants_%28IRRI%29.jpg/640px-Rice_Plants_%28IRRI%29.jpg',
    'Wheat': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Vehn%C3%A4pelto_6.jpg/640px-Vehn%C3%A4pelto_6.jpg',
    'Maize': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Maize_field_in_summer.jpg/640px-Maize_field_in_summer.jpg',
    'Bajra': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Pearl_millet.jpg/640px-Pearl_millet.jpg',
    'Jowar': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Sorghum_bicolor_002.jpg/640px-Sorghum_bicolor_002.jpg',
    'Barley': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Barley_field.jpg/640px-Barley_field.jpg',
    'Ragi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Millet_seeds.jpg/640px-Millet_seeds.jpg',

    // Pulses
    'Lentil': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Lens_culinaris_seeds.jpg/640px-Lens_culinaris_seeds.jpg',
    'Lentils': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Lens_culinaris_seeds.jpg/640px-Lens_culinaris_seeds.jpg',
    'Gram': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Chickpea_India.jpg/640px-Chickpea_India.jpg',
    'Peas': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Peas_in_pods_-_Studio.jpg/640px-Peas_in_pods_-_Studio.jpg',
    'Arhar': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Pigeon_peas.jpg/640px-Pigeon_peas.jpg',
    'Moong': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Mung_bean.jpg/640px-Mung_bean.jpg',
    'Urad': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Black_gram.jpg/640px-Black_gram.jpg',

    // Vegetables
    'Tomato': '/images/crops/tomatoes.png',
    'Potato': '/images/crops/cabbage.png', // Placeholder
    'Potatoes': '/images/crops/cabbage.png', // Placeholder
    'Onion': '/images/crops/cabbage.png', // Placeholder
    'Cabbage': '/images/crops/cabbage.png',
    'Cauliflower': '/images/crops/cauliflower.png',
    'Brinjal': '/images/crops/cabbage.png', // Placeholder
    'Cucumber': '/images/crops/cabbage.png', // Placeholder
    'Vegetables': '/images/crops/cabbage.png', // Placeholder

    // Fruits
    'Mango': '/images/crops/bananas.png', // Placeholder
    'Banana': '/images/crops/bananas.png',
    'Grapes': '/images/crops/bananas.png', // Placeholder
    'Apple': '/images/crops/bananas.png', // Placeholder
    'Orange': '/images/crops/bananas.png', // Placeholder
    'Watermelon': '/images/crops/bananas.png', // Placeholder
    'Muskmelon': '/images/crops/bananas.png', // Placeholder

    // Spices
    'Turmeric': '/images/crops/turmeric.png', // Need a turmeric image? using placeholder for now or existing path if generated
    'Chillies': '/images/crops/chilli.png',
    'Chilli': '/images/crops/chilli.png',
    'Ginger': '/images/crops/turmeric.png', // Fallback
    'Garlic': '/images/crops/turmeric.png', // Fallback

    // Others
    'Coffee': '/images/crops/coffee.png', // Placeholder
    'Tea': '/images/crops/tea.png', // Placeholder
    'Coconut': '/images/crops/coconut.png', // Placeholder
    'Rubber': '/images/crops/sugarcane.png', // Fallback
    'Arecanut': '/images/crops/coconut.png', // Fallback
    'Tapioca': '/images/crops/sugarcane.png', // Fallback

    // Summer crops
    'Summer Maize': '/images/crops/maize.png',
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
