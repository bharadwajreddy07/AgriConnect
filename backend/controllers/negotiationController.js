import Negotiation from '../models/Negotiation.js';
import Crop from '../models/Crop.js';
import Chat from '../models/Chat.js';

// @desc    Start a new negotiation
// @route   POST /api/negotiations
// @access  Private (Wholesaler only)
export const startNegotiation = async (req, res) => {
    try {
        console.log('--- Start Negotiation Debug ---');
        console.log('Request Body:', req.body);
        const { crop, cropId, sampleId, initialPrice, quantity, message } = req.body;

        // Accept both 'crop' and 'cropId' for flexibility
        // Ensure it's a string and trimmed
        const actualCropId = String(crop || cropId).trim();
        console.log('Derived Crop ID:', actualCropId, 'Length:', actualCropId.length);

        if (!actualCropId || actualCropId === 'undefined') {
            console.log('Error: No crop ID provided');
            return res.status(400).json({ message: 'Crop ID is required' });
        }

        // Check if crop exists
        const cropData = await Crop.findById(actualCropId);
        console.log('Database Lookup Result:', cropData ? 'Found' : 'Not Found');

        if (!cropData) {
            // PROOF that new code is running
            return res.status(404).json({ message: `SERVER UPDATED: Crop not found with ID: ${actualCropId} (Len: ${actualCropId.length})` });
        }

        // Create negotiation
        const negotiation = await Negotiation.create({
            crop: actualCropId,
            sample: sampleId,
            farmer: cropData.farmer,
            wholesaler: req.user._id,
            initialPrice: initialPrice || cropData.expectedPrice,
            offerHistory: [
                {
                    offeredBy: 'wholesaler',
                    amount: initialPrice || cropData.expectedPrice,
                    quantity,
                    message,
                },
            ],
            currentOffer: {
                amount: initialPrice || cropData.expectedPrice,
                offeredBy: 'wholesaler',
            },
            agreedQuantity: quantity,
        });

        // Create associated chat
        await Chat.create({
            negotiation: negotiation._id,
            participants: {
                farmer: cropData.farmer,
                wholesaler: req.user._id,
            },
            messages: [
                {
                    sender: req.user._id,
                    senderRole: 'wholesaler',
                    content: message || `Started negotiation with offer of ₹${initialPrice}`,
                    messageType: 'system',
                },
            ],
        });

        const populatedNegotiation = await Negotiation.findById(negotiation._id)
            .populate('crop', 'name category season expectedPrice')
            .populate('farmer', 'name phone email')
            .populate('wholesaler', 'name phone email');

        res.status(201).json({
            success: true,
            data: populatedNegotiation,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get negotiation by ID
// @route   GET /api/negotiations/:id
// @access  Private (Farmer or Wholesaler involved)
export const getNegotiation = async (req, res) => {
    try {
        const negotiation = await Negotiation.findById(req.params.id)
            .populate('crop', 'name category season expectedPrice images')
            .populate('farmer', 'name phone email address')
            .populate('wholesaler', 'name phone email address');

        if (!negotiation) {
            return res.status(404).json({ message: 'Negotiation not found' });
        }

        // Check authorization
        const isFarmer = negotiation.farmer._id.toString() === req.user._id.toString();
        const isWholesaler = negotiation.wholesaler._id.toString() === req.user._id.toString();

        if (!isFarmer && !isWholesaler) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json({
            success: true,
            data: negotiation,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Make a price offer
// @route   POST /api/negotiations/:id/offer
// @access  Private (Farmer or Wholesaler)
export const makeOffer = async (req, res) => {
    try {
        const { amount, quantity, message } = req.body;

        const negotiation = await Negotiation.findById(req.params.id);

        if (!negotiation) {
            return res.status(404).json({ message: 'Negotiation not found' });
        }

        if (negotiation.status !== 'ongoing') {
            return res.status(400).json({ message: 'Negotiation is not active' });
        }

        // Determine who is making the offer
        const isFarmer = negotiation.farmer.toString() === req.user._id.toString();
        const isWholesaler = negotiation.wholesaler.toString() === req.user._id.toString();

        if (!isFarmer && !isWholesaler) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const offeredBy = isFarmer ? 'farmer' : 'wholesaler';

        // Add offer to history
        negotiation.offerHistory.push({
            offeredBy,
            amount,
            quantity,
            message,
        });

        // Update current offer
        negotiation.currentOffer = {
            amount,
            offeredBy,
        };

        await negotiation.save();

        // Add message to chat
        const chat = await Chat.findOne({ negotiation: negotiation._id });
        if (chat) {
            chat.messages.push({
                sender: req.user._id,
                senderRole: offeredBy,
                content: message || `Made an offer of ₹${amount}`,
                messageType: 'offer',
            });
            chat.lastMessage = {
                content: message || `Made an offer of ₹${amount}`,
                timestamp: new Date(),
            };
            await chat.save();
        }

        const populatedNegotiation = await Negotiation.findById(negotiation._id)
            .populate('crop', 'name category season expectedPrice')
            .populate('farmer', 'name phone email')
            .populate('wholesaler', 'name phone email');

        res.json({
            success: true,
            data: populatedNegotiation,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Accept negotiation offer
// @route   PUT /api/negotiations/:id/accept
// @access  Private (Farmer or Wholesaler)
export const acceptOffer = async (req, res) => {
    try {
        const negotiation = await Negotiation.findById(req.params.id)
            .populate('crop', 'name category season expectedPrice images')
            .populate('farmer', 'name phone email')
            .populate('wholesaler', 'name phone email');

        if (!negotiation) {
            return res.status(404).json({ message: 'Negotiation not found' });
        }

        if (negotiation.status !== 'ongoing') {
            return res.status(400).json({ message: 'Negotiation is not active' });
        }

        // Determine who is accepting
        const isFarmer = negotiation.farmer._id.toString() === req.user._id.toString();
        const isWholesaler = negotiation.wholesaler._id.toString() === req.user._id.toString();

        if (!isFarmer && !isWholesaler) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const acceptedBy = isFarmer ? 'farmer' : 'wholesaler';

        // Update acceptance status
        if (isFarmer) {
            negotiation.farmerAccepted = true;
        } else {
            negotiation.wholesalerAccepted = true;
        }

        // Calculate total if not already set
        if (!negotiation.totalAmount && negotiation.currentOffer && negotiation.agreedQuantity) {
            negotiation.totalAmount = negotiation.currentOffer.amount * negotiation.agreedQuantity.value;
        }

        // Set final price
        negotiation.finalAgreedPrice = negotiation.currentOffer.amount;

        // Add system message to chat
        const chat = await Chat.findOne({ negotiation: negotiation._id });
        if (chat) {
            chat.messages.push({
                sender: req.user._id,
                senderRole: acceptedBy,
                content: `${acceptedBy === 'farmer' ? 'Farmer' : 'Wholesaler'} accepted the offer of ₹${negotiation.finalAgreedPrice}`,
                messageType: 'system',
            });
            await chat.save();
        }

        // Check if BOTH parties have accepted
        if (negotiation.farmerAccepted && negotiation.wholesalerAccepted) {
            // Both accepted - create order automatically
            const WholesaleOrder = (await import('../models/WholesaleOrder.js')).default;

            const order = await WholesaleOrder.create({
                crop: negotiation.crop._id,
                farmer: negotiation.farmer._id,
                wholesaler: negotiation.wholesaler._id,
                negotiation: negotiation._id,
                quantity: negotiation.agreedQuantity,
                pricePerUnit: negotiation.finalAgreedPrice,
                totalAmount: negotiation.totalAmount,
                deliveryAddress: {
                    // You may want to get this from request or wholesaler profile
                    street: req.body.deliveryAddress?.street || '',
                    city: req.body.deliveryAddress?.city || '',
                    state: req.body.deliveryAddress?.state || '',
                    pincode: req.body.deliveryAddress?.pincode || '',
                },
                status: 'pending',
            });

            // Update negotiation to completed
            negotiation.status = 'accepted';
            negotiation.acceptedAt = new Date();
            negotiation.createdOrder = order._id;

            // Add order creation message to chat
            if (chat) {
                chat.messages.push({
                    sender: req.user._id,
                    senderRole: 'system',
                    content: `🎉 Order created successfully! Order #${order.orderNumber}`,
                    messageType: 'system',
                });
                await chat.save();
            }

            await negotiation.save();

            return res.json({
                success: true,
                message: 'Both parties accepted! Order created successfully.',
                data: negotiation,
                orderCreated: true,
                order: {
                    _id: order._id,
                    orderNumber: order.orderNumber,
                },
            });
        } else {
            // Only one party accepted - wait for the other
            await negotiation.save();

            const waitingFor = isFarmer ? 'wholesaler' : 'farmer';

            return res.json({
                success: true,
                message: `You accepted the offer. Waiting for ${waitingFor} to accept...`,
                data: negotiation,
                orderCreated: false,
                waitingFor,
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Reject negotiation offer
// @route   PUT /api/negotiations/:id/reject
// @access  Private (Farmer or Wholesaler)
export const rejectOffer = async (req, res) => {
    try {
        const { reason } = req.body;

        const negotiation = await Negotiation.findById(req.params.id);

        if (!negotiation) {
            return res.status(404).json({ message: 'Negotiation not found' });
        }

        // Check authorization
        const isFarmer = negotiation.farmer.toString() === req.user._id.toString();
        const isWholesaler = negotiation.wholesaler.toString() === req.user._id.toString();

        if (!isFarmer && !isWholesaler) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        negotiation.status = 'rejected';

        await negotiation.save();

        // Add system message to chat
        const chat = await Chat.findOne({ negotiation: negotiation._id });
        if (chat) {
            const rejectedBy = isFarmer ? 'farmer' : 'wholesaler';
            chat.messages.push({
                sender: req.user._id,
                senderRole: rejectedBy,
                content: reason || 'Rejected the negotiation',
                messageType: 'system',
            });
            await chat.save();
        }

        res.json({
            success: true,
            message: 'Negotiation rejected',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get user's negotiations
// @route   GET /api/negotiations
// @access  Private
export const getUserNegotiations = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'farmer') {
            query.farmer = req.user._id;
        } else if (req.user.role === 'wholesaler') {
            query.wholesaler = req.user._id;
        }

        const negotiations = await Negotiation.find(query)
            .populate('crop', 'name category season expectedPrice images')
            .populate('farmer', 'name phone')
            .populate('wholesaler', 'name phone')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: negotiations.length,
            data: negotiations,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
