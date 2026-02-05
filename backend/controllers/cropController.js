import Crop from '../models/Crop.js';

// @desc    Create a new crop listing
// @route   POST /api/crops
// @access  Private (Farmer only)
export const createCrop = async (req, res) => {
    try {
        const cropData = {
            ...req.body,
            farmer: req.user._id,
        };

        // Handle uploaded files
        if (req.files) {
            if (req.files.images) {
                cropData.images = req.files.images.map((file) => file.path);
            }
            if (req.files.videos) {
                cropData.videos = req.files.videos.map((file) => file.path);
            }
        }

        const crop = await Crop.create(cropData);

        res.status(201).json({
            success: true,
            data: crop,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all crops with filters
// @route   GET /api/crops
// @access  Public
export const getCrops = async (req, res) => {
    try {
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
            limit = 20
        } = req.query;

        // Build query
        let query = {};

        if (season) query.season = season;
        if (state) query['location.state'] = state;
        if (district) query['location.district'] = district;
        if (category) query.category = category;
        if (qualityGrade) query.qualityGrade = qualityGrade;
        if (organicCertified === 'true') query.organicCertified = true;

        if (status) {
            query.status = status;
        } else {
            query.status = 'approved'; // Default to approved crops
        }

        if (minPrice || maxPrice) {
            query.expectedPrice = {};
            if (minPrice) query.expectedPrice.$gte = parseFloat(minPrice);
            if (maxPrice) query.expectedPrice.$lte = parseFloat(maxPrice);
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        // Sorting logic
        let sortQuery = { createdAt: -1 };
        if (sort) {
            switch (sort) {
                case 'price_low':
                    sortQuery = { expectedPrice: 1 };
                    break;
                case 'price_high':
                    sortQuery = { expectedPrice: -1 };
                    break;
                case 'quantity_high':
                    sortQuery = { 'quantity.value': -1 };
                    break;
                case 'latest':
                default:
                    sortQuery = { createdAt: -1 };
            }
        }

        const total = await Crop.countDocuments(query);

        const crops = await Crop.find(query)
            .populate('farmer', 'name phone region rating')
            .sort(sortQuery)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        res.json({
            success: true,
            count: crops.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: crops,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get farmer's own crops
// @route   GET /api/crops/my-crops
// @access  Private (Farmer)
export const getMyCrops = async (req, res) => {
    try {
        const { category, season, status, search } = req.query;

        let query = { farmer: req.user._id };

        if (category) query.category = category;
        if (season) query.season = season;
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const crops = await Crop.find(query).sort({ createdAt: -1 });

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

// @desc    Get single crop by ID
// @route   GET /api/crops/:id
// @access  Public
export const getCropById = async (req, res) => {
    try {
        const crop = await Crop.findById(req.params.id).populate(
            'farmer',
            'name email phone address region rating isVerified'
        );

        if (!crop) {
            return res.status(404).json({ message: 'Crop not found' });
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

// @desc    Update crop listing
// @route   PUT /api/crops/:id
// @access  Private (Farmer - own crops only)
export const updateCrop = async (req, res) => {
    try {
        let crop = await Crop.findById(req.params.id);

        if (!crop) {
            return res.status(404).json({ message: 'Crop not found' });
        }

        // Check if user owns the crop
        if (crop.farmer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this crop' });
        }

        // Handle uploaded files
        if (req.files) {
            if (req.files.images) {
                req.body.images = req.files.images.map((file) => file.path);
            }
            if (req.files.videos) {
                req.body.videos = req.files.videos.map((file) => file.path);
            }
        }

        crop = await Crop.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.json({
            success: true,
            data: crop,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update crop stock
// @route   PUT /api/crops/:id/stock
// @access  Private (Farmer)
export const updateCropStock = async (req, res) => {
    try {
        const crop = await Crop.findById(req.params.id);

        if (!crop) {
            return res.status(404).json({ message: 'Crop not found' });
        }

        if (crop.farmer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        crop.stockQuantity = req.body.stockQuantity;
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

// @desc    Toggle consumer availability
// @route   PUT /api/crops/:id/toggle-consumer
// @access  Private (Farmer)
export const toggleConsumerAvailability = async (req, res) => {
    try {
        const crop = await Crop.findById(req.params.id);

        if (!crop) {
            return res.status(404).json({ message: 'Crop not found' });
        }

        if (crop.farmer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        crop.availableForConsumers = req.body.availableForConsumers;
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

// @desc    Bulk delete crops
// @route   POST /api/crops/bulk-delete
// @access  Private (Farmer)
export const bulkDeleteCrops = async (req, res) => {
    try {
        const { cropIds } = req.body;

        if (!cropIds || cropIds.length === 0) {
            return res.status(400).json({ message: 'No crop IDs provided' });
        }

        // Verify all crops belong to the farmer
        const crops = await Crop.find({ _id: { $in: cropIds } });
        const unauthorized = crops.some(
            crop => crop.farmer.toString() !== req.user._id.toString()
        );

        if (unauthorized) {
            return res.status(403).json({ message: 'Not authorized to delete some crops' });
        }

        await Crop.deleteMany({ _id: { $in: cropIds } });

        res.json({
            success: true,
            message: `${cropIds.length} crops deleted successfully`,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete crop listing
// @route   DELETE /api/crops/:id
// @access  Private (Farmer - own crops only)
export const deleteCrop = async (req, res) => {
    try {
        const crop = await Crop.findById(req.params.id);

        if (!crop) {
            return res.status(404).json({ message: 'Crop not found' });
        }

        // Check if user owns the crop
        if (crop.farmer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this crop' });
        }

        await crop.deleteOne();

        res.json({
            success: true,
            message: 'Crop deleted successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get farmer's crops
// @route   GET /api/crops/farmer/:farmerId
// @access  Public
export const getFarmerCrops = async (req, res) => {
    try {
        const crops = await Crop.find({ farmer: req.params.farmerId }).sort({
            createdAt: -1,
        });

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

// @desc    Approve crop (Admin only)
// @route   PUT /api/crops/:id/approve
// @access  Private (Admin only)
export const approveCrop = async (req, res) => {
    try {
        const crop = await Crop.findById(req.params.id);

        if (!crop) {
            return res.status(404).json({ message: 'Crop not found' });
        }

        crop.status = req.body.status || 'approved';

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

// @desc    Export farmer's crops to CSV
// @route   GET /api/crops/export
// @access  Private (Farmer)
export const exportCropsToCSV = async (req, res) => {
    try {
        const crops = await Crop.find({ farmer: req.user._id }).sort({ createdAt: -1 });

        if (crops.length === 0) {
            return res.status(404).json({ message: 'No crops to export' });
        }

        // CSV Headers
        const headers = ['Name', 'Category', 'Season', 'Price (₹)', 'Stock', 'Unit', 'Status', 'Consumer Price', 'Quality Grade', 'Organic', 'Location'];

        // Convert crops to CSV rows
        const rows = crops.map(crop => [
            crop.name,
            crop.category,
            crop.season,
            crop.expectedPrice,
            crop.stockQuantity || crop.quantity?.value || 0,
            crop.quantity?.unit || 'unit',
            crop.status,
            crop.consumerPrice || 'N/A',
            crop.qualityGrade || 'Standard',
            crop.organicCertified ? 'Yes' : 'No',
            `${crop.location?.district || ''}, ${crop.location?.state || ''}`
        ]);

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Set response headers for CSV download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="my-crops-${Date.now()}.csv"`);
        res.send(csvContent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
