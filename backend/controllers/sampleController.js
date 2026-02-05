import Sample from '../models/Sample.js';
import Crop from '../models/Crop.js';
import Chat from '../models/Chat.js';

// @desc    Request a sample
// @route   POST /api/samples/request
// @access  Private (Wholesaler only)
export const requestSample = async (req, res) => {
    try {
        const { cropId, requestedQuantity, deliveryAddress, wholesalerNotes } = req.body;

        // Check if crop exists
        const crop = await Crop.findById(cropId);
        if (!crop) {
            return res.status(404).json({ message: 'Crop not found' });
        }

        // Create sample request
        const sample = await Sample.create({
            crop: cropId,
            farmer: crop.farmer,
            wholesaler: req.user._id,
            requestedQuantity,
            deliveryAddress,
            wholesalerNotes,
            status: 'requested',
        });

        // Increment sample requests count on crop
        crop.sampleRequests += 1;
        await crop.save();

        const populatedSample = await Sample.findById(sample._id)
            .populate('crop', 'name category season')
            .populate('farmer', 'name phone email')
            .populate('wholesaler', 'name phone email');

        res.status(201).json({
            success: true,
            data: populatedSample,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get farmer's sample requests
// @route   GET /api/samples/farmer
// @access  Private (Farmer only)
export const getFarmerSamples = async (req, res) => {
    try {
        const samples = await Sample.find({ farmer: req.user._id })
            .populate('crop', 'name category season')
            .populate('wholesaler', 'name phone email address')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: samples.length,
            data: samples,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get wholesaler's sample requests
// @route   GET /api/samples/wholesaler
// @access  Private (Wholesaler only)
export const getWholesalerSamples = async (req, res) => {
    try {
        const samples = await Sample.find({ wholesaler: req.user._id })
            .populate('crop', 'name category season images')
            .populate('farmer', 'name phone email address')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: samples.length,
            data: samples,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update sample status
// @route   PUT /api/samples/:id/status
// @access  Private (Farmer or Wholesaler)
export const updateSampleStatus = async (req, res) => {
    try {
        const { status, farmerNotes, trackingInfo } = req.body;

        const sample = await Sample.findById(req.params.id);

        if (!sample) {
            return res.status(404).json({ message: 'Sample request not found' });
        }

        // Check authorization
        const isFarmer = sample.farmer.toString() === req.user._id.toString();
        const isWholesaler = sample.wholesaler.toString() === req.user._id.toString();

        if (!isFarmer && !isWholesaler) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Update status
        sample.status = status;

        if (farmerNotes) sample.farmerNotes = farmerNotes;
        if (trackingInfo) sample.trackingInfo = trackingInfo;

        // Update timestamps based on status
        if (status === 'sent') sample.sentDate = new Date();
        if (status === 'received') sample.receivedDate = new Date();

        // When farmer accepts sample, create chat for negotiation
        if (status === 'accepted' && isFarmer) {
            // Check if chat already exists
            const existingChat = await Chat.findOne({
                participants: {
                    farmer: sample.farmer,
                    wholesaler: sample.wholesaler
                }
            });

            if (!existingChat) {
                // Create chat between farmer and wholesaler
                await Chat.create({
                    participants: {
                        farmer: sample.farmer,
                        wholesaler: sample.wholesaler,
                    },
                    messages: [
                        {
                            sender: sample.farmer,
                            senderRole: 'farmer',
                            content: `Sample accepted! Ready to negotiate for crop.`,
                            messageType: 'system',
                        },
                    ],
                    lastMessage: {
                        content: `Sample accepted! Ready to negotiate for crop.`,
                        timestamp: new Date(),
                    },
                });
                console.log(`✅ Chat created between farmer ${sample.farmer} and wholesaler ${sample.wholesaler}`);
            }
        }

        await sample.save();

        const populatedSample = await Sample.findById(sample._id)
            .populate('crop', 'name category season')
            .populate('farmer', 'name phone email')
            .populate('wholesaler', 'name phone email');

        res.json({
            success: true,
            data: populatedSample,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Add evaluation to sample
// @route   POST /api/samples/:id/evaluate
// @access  Private (Wholesaler only)
export const evaluateSample = async (req, res) => {
    try {
        const { evaluationNotes, qualityRating } = req.body;

        const sample = await Sample.findById(req.params.id);

        if (!sample) {
            return res.status(404).json({ message: 'Sample request not found' });
        }

        // Check if user is the wholesaler
        if (sample.wholesaler.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        sample.evaluationNotes = evaluationNotes;
        sample.qualityRating = qualityRating;
        sample.status = 'evaluated';
        sample.evaluatedDate = new Date();

        await sample.save();

        const populatedSample = await Sample.findById(sample._id)
            .populate('crop', 'name category season')
            .populate('farmer', 'name phone email')
            .populate('wholesaler', 'name phone email');

        res.json({
            success: true,
            data: populatedSample,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
