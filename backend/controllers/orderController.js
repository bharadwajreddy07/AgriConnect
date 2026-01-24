import Order from '../models/Order.js';
import Crop from '../models/Crop.js';
import Negotiation from '../models/Negotiation.js';

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private (Wholesaler or Consumer)
export const placeOrder = async (req, res) => {
    try {
        const {
            cropId,
            negotiationId,
            quantity,
            pricePerUnit,
            deliveryAddress,
            paymentMethod,
        } = req.body;

        // Check if crop exists
        const crop = await Crop.findById(cropId);
        if (!crop) {
            return res.status(404).json({ message: 'Crop not found' });
        }

        // Calculate total amount
        const totalAmount = pricePerUnit * quantity.value;

        // Determine buyer type
        const buyerType = req.user.role === 'wholesaler' ? 'wholesaler' : 'consumer';

        // Create order
        const order = await Order.create({
            buyer: req.user._id,
            buyerType,
            seller: crop.farmer,
            crop: cropId,
            negotiation: negotiationId,
            quantity,
            pricePerUnit,
            totalAmount,
            deliveryAddress,
            paymentMethod: paymentMethod || 'cod',
            statusHistory: [
                {
                    status: 'placed',
                    timestamp: new Date(),
                    notes: 'Order placed successfully',
                },
            ],
        });

        // Update crop status if fully sold
        if (quantity.value >= crop.quantity.value) {
            crop.status = 'sold';
            await crop.save();
        }

        const populatedOrder = await Order.findById(order._id)
            .populate('buyer', 'name phone email')
            .populate('seller', 'name phone email address')
            .populate('crop', 'name category season images');

        res.status(201).json({
            success: true,
            data: populatedOrder,
        });
    } catch (error) {
        console.error(error);
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
            .populate('crop', 'name category season images')
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
