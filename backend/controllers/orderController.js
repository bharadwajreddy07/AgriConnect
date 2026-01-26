import Order from '../models/Order.js';
import Crop from '../models/Crop.js';
import Negotiation from '../models/Negotiation.js';

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private (Wholesaler or Consumer)
export const placeOrder = async (req, res) => {
    try {
        console.log('Request Body:', JSON.stringify(req.body, null, 2));
        const { items, deliveryAddress, paymentMethod } = req.body;

        // Determine buyer
        const buyer = req.user._id;
        const buyerType = req.user.role === 'wholesaler' ? 'wholesaler' : 'consumer';

        // Normalize items: If single item (from negotiation), wrap in array. If cart items, use as is.
        // Cart item structure: { cropId, quantity }
        // Negotiation item structure: { cropId, negotiationId, quantity, pricePerUnit }

        let orderItems = [];
        if (items && Array.isArray(items)) {
            orderItems = items;
        } else {
            // Handle single item request (backward compatibility)
            orderItems = [{
                cropId: req.body.cropId,
                negotiationId: req.body.negotiationId,
                quantity: req.body.quantity,
                pricePerUnit: req.body.pricePerUnit
            }];
        }

        const createdOrders = [];

        for (const item of orderItems) {
            const crop = await Crop.findById(item.cropId);
            if (!crop) continue; // Skip if crop not found

            // Resolve Price: Explicit (negotiation) or Market (crop price)
            let finalPricePerUnit = item.pricePerUnit;
            if (!finalPricePerUnit) {
                // Clean price string if from crop data
                // FIX: Use consumerPrice or expectedPrice as per schema
                const rawPrice = buyerType === 'consumer'
                    ? (crop.consumerPrice || crop.expectedPrice)
                    : crop.expectedPrice;

                if (typeof rawPrice === 'number') {
                    finalPricePerUnit = rawPrice;
                } else {
                    finalPricePerUnit = parseFloat(rawPrice?.toString().replace(/[^0-9.]/g, '') || 0);
                }
            }

            // Quantity value check (if object vs number)
            const qtyValue = (item.quantity && typeof item.quantity === 'object') ? item.quantity.value : item.quantity;

            if (!qtyValue || isNaN(qtyValue)) {
                console.error(`Invalid quantity for item: ${item.cropId}`, item.quantity);
                continue;
            }

            // Calculate Total
            const totalAmount = finalPricePerUnit * qtyValue;

            if (isNaN(totalAmount) || totalAmount < 0) {
                console.error(`Invalid total amount for item: ${item.cropId}, Price: ${finalPricePerUnit}, Qty: ${qtyValue}`);
                continue;
            }

            if (!crop.farmer) {
                console.error(`Crop ${item.cropId} has no farmer assigned`);
                continue;
            }

            const orderNumber = `ORD-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`.toUpperCase();

            const orderPayload = {
                orderNumber,
                buyer,
                buyerType,
                seller: crop.farmer,
                crop: crop._id,
                items: [{
                    crop: crop._id,
                    farmer: crop.farmer,
                    quantity: qtyValue,
                    price: finalPricePerUnit,
                    total: totalAmount
                }],
                negotiation: item.negotiationId,
                quantity: { value: qtyValue, unit: crop.quantity.unit || 'kg' },
                pricePerUnit: finalPricePerUnit,
                totalAmount,
                deliveryAddress,
                paymentMethod: paymentMethod || 'cod',
                statusHistory: [{
                    status: 'placed',
                    timestamp: new Date(),
                    notes: 'Order placed successfully'
                }]
            };
            console.log('PAYLOAD:', JSON.stringify(orderPayload, null, 2));

            const newOrder = await Order.create(orderPayload);

            // Update stock (simple decrement for now, can be improved)
            // Note: assuming quantity.value is the stock tracking unit
            if (crop.quantity.value >= qtyValue) {
                crop.quantity.value -= qtyValue;
                if (crop.quantity.value <= 0) {
                    crop.status = 'sold';
                }
                await crop.save();
            }

            createdOrders.push(newOrder);
        }

        if (createdOrders.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Failed to create order. Please check item availability and prices.'
            });
        }

        res.status(201).json({
            success: true,
            count: createdOrders.length,
            data: createdOrders // Return array of orders
        });

    } catch (error) {
        console.error('!!! ORDER CREATE FAILED !!!');
        console.error(error.message);
        if (error.errors) {
            Object.keys(error.errors).forEach(key => {
                console.error(`- VALIDATION ERROR [${key}]: ${error.errors[key].message}`);
            });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
export const getUserOrders = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'farmer') {
            query.seller = req.user._id;
        } else {
            query.buyer = req.user._id;
        }

        const orders = await Order.find(query)
            .populate('buyer', 'name phone email')
            .populate('seller', 'name phone email')
            .populate('seller', 'name phone email')
            .populate('crop', 'name category season images')
            .populate({
                path: 'items.crop',
                select: 'name category season images'
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

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('buyer', 'name phone email address')
            .populate('seller', 'name phone email address')
            .populate('crop', 'name category season images expectedPrice');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check authorization
        const isBuyer = order.buyer._id.toString() === req.user._id.toString();
        const isSeller = order.seller._id.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isBuyer && !isSeller && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized' });
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

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Seller or Admin)
export const updateOrderStatus = async (req, res) => {
    try {
        const { status, notes } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check authorization
        const isSeller = order.seller.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isSeller && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Update status
        order.orderStatus = status;
        order.statusHistory.push({
            status,
            timestamp: new Date(),
            notes,
        });

        // Update timestamps based on status
        if (status === 'confirmed') order.confirmedAt = new Date();
        if (status === 'shipped') order.shippedAt = new Date();
        if (status === 'delivered') order.deliveredAt = new Date();
        if (status === 'cancelled') order.cancelledAt = new Date();

        await order.save();

        const populatedOrder = await Order.findById(order._id)
            .populate('buyer', 'name phone email')
            .populate('seller', 'name phone email')
            .populate('crop', 'name category season');

        res.json({
            success: true,
            data: populatedOrder,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update tracking information
// @route   PUT /api/orders/:id/tracking
// @access  Private (Seller or Admin)
export const updateTracking = async (req, res) => {
    try {
        const { trackingInfo } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check authorization
        const isSeller = order.seller.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isSeller && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        order.trackingInfo = {
            ...order.trackingInfo,
            ...trackingInfo,
        };

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

// @desc    Update payment status
// @route   PUT /api/orders/:id/payment
// @access  Private (Admin)
export const updatePaymentStatus = async (req, res) => {
    try {
        const { paymentStatus } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.paymentStatus = paymentStatus;

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

// @desc    Add rating and review
// @route   PUT /api/orders/:id/rating
// @access  Private (Buyer)
export const addRating = async (req, res) => {
    try {
        const { value, review } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user is the buyer
        if (order.buyer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Check if order is delivered
        if (order.orderStatus !== 'delivered') {
            return res.status(400).json({ message: 'Can only rate delivered orders' });
        }

        order.rating = {
            value,
            review,
            timestamp: new Date(),
        };

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
