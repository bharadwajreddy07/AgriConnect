const createId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

export const localUsers = [
    {
        _id: 'admin-demo-1',
        name: 'Main Admin',
        email: 'superadmin@agrimart.com',
        password: 'Admin@2026',
        phone: '9333333333',
        role: 'admin',
        isVerified: true,
        address: {},
        region: 'South India',
    },
    {
        _id: 'consumer-demo-1',
        name: 'Test Consumer',
        email: 'consumer@test.com',
        password: 'password123',
        phone: '9000000000',
        role: 'consumer',
        isVerified: true,
        address: {},
        region: '',
    },
    {
        _id: 'farmer-demo-1',
        name: 'Demo Farmer',
        email: 'farmer@test.com',
        password: 'password123',
        phone: '9876543210',
        role: 'farmer',
        isVerified: true,
        address: { village: 'Guntur', district: 'Guntur', state: 'AP', pincode: '522001' },
        region: 'South India',
    },
    {
        _id: 'wholesaler-demo-1',
        name: 'Demo Wholesaler',
        email: 'wholesaler@test.com',
        password: 'password123',
        phone: '9222222222',
        role: 'wholesaler',
        isVerified: true,
        address: {},
        region: 'South India',
    },
];

export const localCrops = [
    {
        _id: createId('crop'),
        farmer: { _id: 'farmer-demo-1', name: 'Demo Farmer', phone: '9876543210', region: 'South India', rating: { average: 4.8, count: 120 } },
        name: 'Basmati Rice',
        category: 'Cereals',
        season: 'Kharif',
        quantity: { value: 120, unit: 'quintal' },
        expectedPrice: 85,
        location: { region: 'Punjab', state: 'Punjab', district: 'Ludhiana' },
        description: 'Premium rice with excellent grain length.',
        qualityGrade: 'Premium',
        organicCertified: true,
        status: 'approved',
        views: 18,
        availableForConsumers: true,
        consumerPrice: 102,
        stockQuantity: 65,
        minOrderQuantity: { value: 1, unit: 'kg' },
        deliveryOptions: { homeDelivery: true, pickupAvailable: true, deliveryCharge: 0 },
        images: ['/images/crops/paddy.png'],
    },
    {
        _id: createId('crop'),
        farmer: { _id: 'farmer-demo-1', name: 'Demo Farmer', phone: '9876543210', region: 'South India', rating: { average: 4.8, count: 120 } },
        name: 'Alphonso Mangoes',
        category: 'Fruits',
        season: 'Zaid',
        quantity: { value: 40, unit: 'quintal' },
        expectedPrice: 120,
        location: { region: 'Maharashtra', state: 'Maharashtra', district: 'Ratnagiri' },
        description: 'Sweet and juicy mangoes directly from orchard.',
        qualityGrade: 'Grade A',
        organicCertified: true,
        status: 'approved',
        views: 11,
        availableForConsumers: true,
        consumerPrice: 145,
        stockQuantity: 28,
        minOrderQuantity: { value: 1, unit: 'kg' },
        deliveryOptions: { homeDelivery: true, pickupAvailable: true, deliveryCharge: 0 },
        images: ['/images/crops/mangoes.png'],
    },
    {
        _id: createId('crop'),
        farmer: { _id: 'farmer-demo-1', name: 'Demo Farmer', phone: '9876543210', region: 'South India', rating: { average: 4.8, count: 120 } },
        name: 'Tomatoes',
        category: 'Vegetables',
        season: 'Year-Round',
        quantity: { value: 85, unit: 'quintal' },
        expectedPrice: 25,
        location: { region: 'Karnataka', state: 'Karnataka', district: 'Bangalore' },
        description: 'Fresh farm tomatoes for daily supply.',
        qualityGrade: 'Grade A',
        organicCertified: false,
        status: 'approved',
        views: 24,
        availableForConsumers: true,
        consumerPrice: 30,
        stockQuantity: 120,
        minOrderQuantity: { value: 1, unit: 'kg' },
        deliveryOptions: { homeDelivery: true, pickupAvailable: true, deliveryCharge: 0 },
        images: ['/images/crops/tomatoes.png'],
    },
    {
        _id: createId('crop'),
        farmer: { _id: 'farmer-demo-1', name: 'Demo Farmer', phone: '9876543210', region: 'South India', rating: { average: 4.8, count: 120 } },
        name: 'Green Grapes',
        category: 'Fruits',
        season: 'Rabi',
        quantity: { value: 60, unit: 'quintal' },
        expectedPrice: 50,
        location: { region: 'Maharashtra', state: 'Maharashtra', district: 'Nashik' },
        description: 'Tasty seedless green grapes.',
        qualityGrade: 'Premium',
        organicCertified: true,
        status: 'approved',
        views: 14,
        availableForConsumers: true,
        consumerPrice: 60,
        stockQuantity: 45,
        minOrderQuantity: { value: 1, unit: 'kg' },
        deliveryOptions: { homeDelivery: true, pickupAvailable: true, deliveryCharge: 0 },
        images: ['/images/crops/grapes.png'],
    },
];

export const localOrders = [];

export const findLocalUserByEmail = (email) => {
    const normalized = String(email || '').toLowerCase();
    return localUsers.find((user) => user.email.toLowerCase() === normalized) || null;
};

export const findLocalUserById = (id) => {
    return localUsers.find((user) => user._id === String(id)) || null;
};

export const upsertLocalUser = (user) => {
    const existingIndex = localUsers.findIndex((item) => item._id === user._id || item.email.toLowerCase() === String(user.email || '').toLowerCase());
    const nextUser = { ...user };

    if (existingIndex >= 0) {
        localUsers[existingIndex] = nextUser;
    } else {
        localUsers.push(nextUser);
    }

    return nextUser;
};

export const filterLocalCrops = (query = {}) => {
    const {
        season,
        state,
        district,
        category,
        minPrice,
        maxPrice,
        status,
        search,
        qualityGrade,
        organicCertified,
        sort,
        page = 1,
        limit = 20,
    } = query;

    let crops = [...localCrops];

    if (season) crops = crops.filter((crop) => crop.season === season);
    if (state) crops = crops.filter((crop) => crop.location.state === state);
    if (district) crops = crops.filter((crop) => crop.location.district === district);
    if (category) crops = crops.filter((crop) => crop.category === category);
    if (qualityGrade) crops = crops.filter((crop) => crop.qualityGrade === qualityGrade);
    if (organicCertified === 'true') crops = crops.filter((crop) => crop.organicCertified);

    const cropStatus = status || 'approved';
    crops = crops.filter((crop) => crop.status === cropStatus);

    if (minPrice || maxPrice) {
        crops = crops.filter((crop) => {
            const price = crop.expectedPrice || 0;
            if (minPrice && price < parseFloat(minPrice)) return false;
            if (maxPrice && price > parseFloat(maxPrice)) return false;
            return true;
        });
    }

    if (search) {
        const needle = String(search).toLowerCase();
        crops = crops.filter((crop) => {
            return crop.name.toLowerCase().includes(needle) || String(crop.description || '').toLowerCase().includes(needle);
        });
    }

    if (sort === 'price_low') crops.sort((a, b) => a.expectedPrice - b.expectedPrice);
    else if (sort === 'price_high') crops.sort((a, b) => b.expectedPrice - a.expectedPrice);
    else if (sort === 'quantity_high') crops.sort((a, b) => (b.quantity?.value || 0) - (a.quantity?.value || 0));
    else crops.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 20;
    const total = crops.length;
    const start = (pageNumber - 1) * pageSize;
    const paged = crops.slice(start, start + pageSize);

    return {
        success: true,
        count: paged.length,
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize) || 1,
        data: paged,
    };
};

export const findLocalCropById = (id) => {
    return localCrops.find((crop) => crop._id === String(id)) || null;
};

export const updateLocalCropStock = (cropId, quantity) => {
    const crop = findLocalCropById(cropId);
    if (!crop) {
        return null;
    }

    crop.stockQuantity = Math.max(0, (crop.stockQuantity || 0) - quantity);
    if (crop.stockQuantity === 0) {
        crop.status = 'sold';
    }

    return crop;
};

export const createLocalOrder = (orderData) => {
    const order = {
        _id: createId('order'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...orderData,
    };

    localOrders.unshift(order);
    return order;
};

export const findLocalOrdersByBuyer = (buyerId) => {
    return localOrders.filter((order) => String(order.buyer?._id || order.buyer) === String(buyerId));
};

export const findLocalOrderById = (orderId) => {
    return localOrders.find((order) => order._id === String(orderId)) || null;
};
