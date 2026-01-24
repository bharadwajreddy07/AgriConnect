import Order from '../models/Order.js';
import Crop from '../models/Crop.js';

// @desc    Get marketplace crops (available for consumers)
// @route   GET /api/marketplace/crops
// @access  Public
export const getMarketplaceCrops = async (req, res) => {
    try {
        const { category, season, minPrice, maxPrice, search, sort } = req.query;

        let query = {
            availableForConsumers: true,
            status: 'approved',
            stockQuantity: { $gt: 0 },
        };

        if (category) query.category = category;
        if (season) query.season = season;
        if (minPrice || maxPrice) {
            query.consumerPrice = {};
            if (minPrice) query.consumerPrice.$gte = parseFloat(minPrice);
            if (maxPrice) query.consumerPrice.$lte = parseFloat(maxPrice);
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'price_low') sortOption = { consumerPrice: 1 };
        if (sort === 'price_high') sortOption = { consumerPrice: -1 };
        if (sort === 'popular') sortOption = { views: -1 };

        const crops = await Crop.find(query)
            .populate('farmer', 'name phone region rating')
            .sort(sortOption);

        res.json({
            success: true,
            count: crops.length,
            data: crops,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get single marketplace crop
// @route   GET /api/marketplace/crops/:id
// @access  Public
export const getMarketplaceCrop = async (req, res) => {
    try {
        const crop = await Crop.findById(req.params.id).populate(
            'farmer',
            'name email phone address region rating isVerified'
        );

        if (!crop) {
            return res.status(404).json({ message: 'Crop not found' });
        }

        if (!crop.availableForConsumers) {
            return res.status(400).json({ message: 'This crop is not available for consumers' });
        }

        // Increment views
        crop.views += 1;
        await crop.save();

        res.json({
            success: true,
            data: crop,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Place consumer order
// @route   POST /api/marketplace/orders
// @access  Private (Consumer)
export const placeConsumerOrder = async (req, res) => {
    try {
        const { items, deliveryAddress, paymentMethod } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items in order' });
        }

        let totalAmount = 0;
        const orderItems = [];

        // Validate and calculate total
        for (const item of items) {
            const crop = await Crop.findById(item.cropId);

            if (!crop || !crop.availableForConsumers) {
                return res.status(400).json({ message: `Crop ${item.cropId} not available` });
            }

            if (crop.stockQuantity < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for ${crop.name}. Available: ${crop.stockQuantity}`
                });
            }

            const itemTotal = crop.consumerPrice * item.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                crop: crop._id,
                farmer: crop.farmer,
                quantity: item.quantity,
                price: crop.consumerPrice,
                total: itemTotal,
            });

            // Reduce stock
            crop.stockQuantity -= item.quantity;
            if (crop.stockQuantity === 0) {
                crop.status = 'sold';
            }
            await crop.save();
        }

        // Create order
        const order = await Order.create({
            buyer: req.user._id,
            items: orderItems,
            totalAmount,
            deliveryAddress,
            paymentMethod: paymentMethod || 'COD',
            paymentStatus: paymentMethod === 'COD' ? 'pending' : 'paid',
            orderStatus: 'placed',
            orderType: 'consumer',
        });

        const populatedOrder = await Order.findById(order._id)
            .populate('buyer', 'name email phone')
            .populate({
                path: 'items.crop',
                select: 'name category images',
            })
            .populate({
                path: 'items.farmer',
                select: 'name phone',
            });

        res.status(201).json({
            success: true,
            data: populatedOrder,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get consumer orders
// @route   GET /api/marketplace/orders
// @access  Private (Consumer)
export const getConsumerOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            buyer: req.user._id,
            orderType: 'consumer',
        })
            .populate({
                path: 'items.crop',
                select: 'name category images',
            })
            .populate({
                path: 'items.farmer',
                select: 'name phone',
            })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: orders.length,
            data: orders,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get order tracking details
// @route   GET /api/marketplace/orders/:id/track
// @access  Private
export const trackOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('buyer', 'name email phone')
            .populate({
                path: 'items.crop',
                select: 'name category images',
            })
            .populate({
                path: 'items.farmer',
                select: 'name phone address',
            });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user is authorized to view this order
        if (
            order.buyer._id.toString() !== req.user._id.toString() &&
            !order.items.some(item => item.farmer._id.toString() === req.user._id.toString()) &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({ message: 'Not authorized to view this order' });
        }

        res.json({
            success: true,
            data: order,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update order status (Farmer)
// @route   PUT /api/marketplace/orders/:id/status
// @access  Private (Farmer)
export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user is the farmer for this order
        const isFarmer = order.items.some(
            item => item.farmer.toString() === req.user._id.toString()
        );

        if (!isFarmer && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this order' });
        }

        order.orderStatus = status;

        if (status === 'shipped') {
            order.shippedAt = Date.now();
        } else if (status === 'delivered') {
            order.deliveredAt = Date.now();
        }

        await order.save();

        res.json({
            success: true,
            data: order,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get farmer's consumer orders
// @route   GET /api/marketplace/farmer/orders
// @access  Private (Farmer)
export const getFarmerConsumerOrders = async (req, res) => {
    try {
        const { status, search } = req.query;

        // Build query to find orders containing farmer's crops
        let query = {
            orderType: 'consumer',
            'items.farmer': req.user._id,
        };

        if (status && status !== 'all') {
            query.orderStatus = status;
        }

        let orders = await Order.find(query)
            .populate('buyer', 'name email phone')
            .populate({
                path: 'items.crop',
                select: 'name category images consumerPrice',
            })
            .populate({
                path: 'items.farmer',
                select: 'name phone',
            })
            .sort({ createdAt: -1 });

        // Filter to only show items from this farmer
        orders = orders.map(order => {
            const farmerItems = order.items.filter(
                item => item.farmer._id.toString() === req.user._id.toString()
            );

            return {
                ...order.toObject(),
                items: farmerItems,
                farmerTotal: farmerItems.reduce((sum, item) => sum + item.total, 0),
            };
        });

        // Apply search filter if provided
        if (search) {
            const searchLower = search.toLowerCase();
            orders = orders.filter(order =>
                order.orderNumber.toLowerCase().includes(searchLower) ||
                order.buyer.name.toLowerCase().includes(searchLower) ||
                order.items.some(item =>
                    item.crop.name.toLowerCase().includes(searchLower)
                )
            );
        }

        res.json({
            success: true,
            count: orders.length,
            data: orders,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update consumer order status (Farmer)
// @route   PUT /api/marketplace/farmer/orders/:id/status
// @access  Private (Farmer)
export const updateConsumerOrderStatus = async (req, res) => {
    try {
        const { status, notes } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user is the farmer for this order
        const isFarmer = order.items.some(
            item => item.farmer.toString() === req.user._id.toString()
        );

        if (!isFarmer) {
            return res.status(403).json({ message: 'Not authorized to update this order' });
        }

        // Update order status
        order.orderStatus = status;

        // Add to status history
        order.statusHistory.push({
            status,
            timestamp: Date.now(),
            notes: notes || `Order ${status} by farmer`,
        });

        // Update specific timestamps
        if (status === 'confirmed') {
            order.confirmedAt = Date.now();
        } else if (status === 'shipped') {
            order.shippedAt = Date.now();
        } else if (status === 'delivered') {
            order.deliveredAt = Date.now();
            order.paymentStatus = 'paid'; // Mark as paid on delivery for COD
        }

        await order.save();

        // Populate for response
        await order.populate('buyer', 'name email phone');
        await order.populate({
            path: 'items.crop',
            select: 'name category images',
        });
        await order.populate({
            path: 'items.farmer',
            select: 'name phone',
        });

        res.json({
            success: true,
            data: order,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Add tracking info to order
// @route   PUT /api/marketplace/farmer/orders/:id/tracking
// @access  Private (Farmer)
export const addTrackingInfo = async (req, res) => {
    try {
        const { courierName, trackingNumber, estimatedDelivery } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user is the farmer for this order
        const isFarmer = order.items.some(
            item => item.farmer.toString() === req.user._id.toString()
        );

        if (!isFarmer) {
            return res.status(403).json({ message: 'Not authorized to update this order' });
        }

        // Update tracking info
        order.trackingInfo = {
            courierName,
            trackingNumber,
            estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined,
        };

        // If adding tracking, update status to shipped if not already
        if (order.orderStatus === 'packed' || order.orderStatus === 'processing') {
            order.orderStatus = 'shipped';
            order.shippedAt = Date.now();
            order.statusHistory.push({
                status: 'shipped',
                timestamp: Date.now(),
                notes: `Shipped via ${courierName}`,
            });
        }

        await order.save();

        // Populate for response
        await order.populate('buyer', 'name email phone');
        await order.populate({
            path: 'items.crop',
            select: 'name category images',
        });
        await order.populate({
            path: 'items.farmer',
            select: 'name phone',
        });

        res.json({
            success: true,
            data: order,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
