import WholesaleOrder from '../models/WholesaleOrder.js';
import Negotiation from '../models/Negotiation.js';
import Crop from '../models/Crop.js';
import fs from 'fs';
import path from 'path';

const logError = (error, context) => {
    const logPath = path.join(process.cwd(), 'order-errors.log');
    const logEntry = `\n=== ${new Date().toISOString()} ===\nContext: ${context}\nError: ${error.message}\nStack: ${error.stack}\n`;
    fs.appendFileSync(logPath, logEntry);
};

// @desc    Create wholesale order from negotiation
// @route   POST /api/wholesale-orders/from-negotiation/:negotiationId
// @access  Private (Wholesaler)
export const createOrderFromNegotiation = async (req, res) => {
    try {
        const { negotiationId } = req.params;
        const { deliveryAddress, deliveryTerms, paymentTerms, paymentMethod, notes } = req.body;

        // Get negotiation
        const negotiation = await Negotiation.findById(negotiationId)
            .populate('crop')
            .populate('farmer');

        if (!negotiation) {
            return res.status(404).json({ message: 'Negotiation not found' });
        }

        // Verify negotiation is accepted
        if (negotiation.status !== 'accepted') {
            return res.status(400).json({ message: 'Negotiation must be accepted before creating order' });
        }

        // Verify user is the wholesaler
        if (negotiation.wholesaler.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Check if order already exists for this negotiation
        const existingOrder = await WholesaleOrder.findOne({ negotiation: negotiationId });
        if (existingOrder) {
            return res.status(400).json({ message: 'Order already exists for this negotiation' });
        }

        // Create order
        const order = await WholesaleOrder.create({
            wholesaler: req.user._id,
            farmer: negotiation.farmer._id,
            crop: negotiation.crop._id,
            negotiation: negotiationId,
            quantity: negotiation.agreedQuantity,
            pricePerUnit: negotiation.finalAgreedPrice,
            totalAmount: negotiation.totalAmount,
            deliveryAddress,
            deliveryTerms: deliveryTerms || 'Standard Delivery',
            paymentTerms: paymentTerms || 'Payment on Delivery',
            paymentMethod: paymentMethod || 'cod',
            notes,
        });

        const populatedOrder = await WholesaleOrder.findById(order._id)
            .populate('wholesaler', 'name email phone')
            .populate('farmer', 'name email phone address')
            .populate('crop', 'name category images');

        res.status(201).json({
            success: true,
            data: populatedOrder,
        });
    } catch (error) {
        console.error('Error creating order from negotiation:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create wholesale order directly
// @route   POST /api/wholesale-orders
// @access  Private (Wholesaler)
export const createOrder = async (req, res) => {
    try {
        console.log('=== Creating Wholesale Order ===');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        console.log('User:', req.user._id, req.user.role);

        const { cropId, quantity, deliveryAddress, deliveryTerms, paymentTerms, paymentMethod, notes } = req.body;

        // Validate required fields
        if (!cropId) {
            return res.status(400).json({ message: 'Crop ID is required' });
        }

        if (!quantity || typeof quantity !== 'object' || !quantity.value || !quantity.unit) {
            console.error('Invalid quantity format:', quantity);
            return res.status(400).json({
                message: 'Invalid quantity format. Expected: { value: number, unit: string }',
                received: quantity
            });
        }

        if (!deliveryAddress || !deliveryAddress.name || !deliveryAddress.phone || !deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.pincode) {
            console.error('Invalid delivery address:', deliveryAddress);
            return res.status(400).json({
                message: 'Complete delivery address is required (name, phone, street, city, state, pincode)',
                received: deliveryAddress
            });
        }

        // Get crop
        const crop = await Crop.findById(cropId);
        if (!crop) {
            return res.status(404).json({ message: 'Crop not found' });
        }

        console.log('Found crop:', crop.name, 'Price:', crop.expectedPrice);

        // Verify crop is approved
        if (crop.status !== 'approved') {
            return res.status(400).json({ message: 'Crop is not available for purchase' });
        }

        // Calculate total
        const pricePerUnit = crop.expectedPrice;
        const totalAmount = pricePerUnit * parseFloat(quantity.value);

        console.log('Calculated total:', totalAmount, '=', pricePerUnit, '*', quantity.value);

        // Create order
        const order = await WholesaleOrder.create({
            wholesaler: req.user._id,
            farmer: crop.farmer,
            crop: cropId,
            quantity: {
                value: parseFloat(quantity.value),
                unit: quantity.unit
            },
            pricePerUnit,
            totalAmount,
            deliveryAddress: {
                name: deliveryAddress.name,
                phone: deliveryAddress.phone,
                street: deliveryAddress.street,
                city: deliveryAddress.city,
                state: deliveryAddress.state,
                pincode: deliveryAddress.pincode
            },
            deliveryTerms: deliveryTerms || 'Standard Delivery',
            paymentTerms: paymentTerms || 'Payment on Delivery',
            paymentMethod: paymentMethod || 'cod',
            notes: notes || '',
        });

        console.log('Order created successfully:', order._id);

        const populatedOrder = await WholesaleOrder.findById(order._id)
            .populate('wholesaler', 'name email phone')
            .populate('farmer', 'name email phone address')
            .populate('crop', 'name category images');

        res.status(201).json({
            success: true,
            data: populatedOrder,
        });
    } catch (error) {
        console.error('=== Error Creating Order ===');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        logError(error, 'createOrder');
        res.status(500).json({
            message: 'Server error while creating order',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// @desc    Get all wholesale orders for user
// @route   GET /api/wholesale-orders
// @access  Private
export const getOrders = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'wholesaler') {
            query.wholesaler = req.user._id;
        } else if (req.user.role === 'farmer') {
            query.farmer = req.user._id;
        }

        const orders = await WholesaleOrder.find(query)
            .populate('wholesaler', 'name email phone')
            .populate('farmer', 'name email phone address')
            .populate('crop', 'name category images expectedPrice')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: orders.length,
            data: orders,
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get single wholesale order
// @route   GET /api/wholesale-orders/:id
// @access  Private
export const getOrder = async (req, res) => {
    try {
        const order = await WholesaleOrder.findById(req.params.id)
            .populate('wholesaler', 'name email phone address')
            .populate('farmer', 'name email phone address')
            .populate('crop', 'name category images expectedPrice quantity')
            .populate('negotiation');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check authorization
        const isWholesaler = order.wholesaler._id.toString() === req.user._id.toString();
        const isFarmer = order.farmer._id.toString() === req.user._id.toString();

        if (!isWholesaler && !isFarmer && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json({
            success: true,
            data: order,
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update order status
// @route   PUT /api/wholesale-orders/:id/status
// @access  Private (Farmer or Admin)
export const updateOrderStatus = async (req, res) => {
    try {
        const { status, note } = req.body;

        const order = await WholesaleOrder.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check authorization (farmer can update their orders, admin can update any)
        const isFarmer = order.farmer.toString() === req.user._id.toString();
        if (!isFarmer && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Update status
        order.status = status;
        order.statusHistory.push({
            status,
            timestamp: new Date(),
            note: note || `Status updated to ${status}`,
        });

        // Set delivery date if delivered
        if (status === 'delivered' && !order.actualDeliveryDate) {
            order.actualDeliveryDate = new Date();
        }

        await order.save();

        const populatedOrder = await WholesaleOrder.findById(order._id)
            .populate('wholesaler', 'name email phone')
            .populate('farmer', 'name email phone')
            .populate('crop', 'name category images');

        res.json({
            success: true,
            data: populatedOrder,
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Cancel order
// @route   PUT /api/wholesale-orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res) => {
    try {
        const { reason } = req.body;

        const order = await WholesaleOrder.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check authorization
        const isWholesaler = order.wholesaler.toString() === req.user._id.toString();
        const isFarmer = order.farmer.toString() === req.user._id.toString();

        if (!isWholesaler && !isFarmer && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Can only cancel if not delivered
        if (order.status === 'delivered') {
            return res.status(400).json({ message: 'Cannot cancel delivered order' });
        }

        order.status = 'cancelled';
        order.cancellationReason = reason || 'Cancelled by user';
        order.statusHistory.push({
            status: 'cancelled',
            timestamp: new Date(),
            note: reason || 'Order cancelled',
        });

        await order.save();

        res.json({
            success: true,
            message: 'Order cancelled successfully',
            data: order,
        });
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
