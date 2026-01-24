import User from '../models/User.js';
import Crop from '../models/Crop.js';
import Order from '../models/Order.js';
import Negotiation from '../models/Negotiation.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
export const getAllUsers = async (req, res) => {
    try {
        const { role, isVerified } = req.query;

        let query = {};
        if (role) query.role = role;
        if (isVerified !== undefined) query.isVerified = isVerified === 'true';

        const users = await User.find(query).select('-password').sort({ createdAt: -1 });

        res.json({
            success: true,
            count: users.length,
            data: users,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Verify user (farmer/wholesaler)
// @route   PUT /api/admin/users/:id/verify
// @access  Private (Admin only)
export const verifyUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isVerified = true;

        await user.save();

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get pending crop approvals
// @route   GET /api/admin/crops/pending
// @access  Private (Admin only)
export const getPendingCrops = async (req, res) => {
    try {
        const crops = await Crop.find({ status: 'pending' })
            .populate('farmer', 'name email phone region')
            .sort({ createdAt: -1 });

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

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
export const getAnalytics = async (req, res) => {
    try {
        // User statistics
        const totalUsers = await User.countDocuments();
        const farmerCount = await User.countDocuments({ role: 'farmer' });
        const wholesalerCount = await User.countDocuments({ role: 'wholesaler' });
        const consumerCount = await User.countDocuments({ role: 'consumer' });
        const verifiedFarmers = await User.countDocuments({
            role: 'farmer',
            isVerified: true,
        });
        const verifiedWholesalers = await User.countDocuments({
            role: 'wholesaler',
            isVerified: true,
        });

        // Crop statistics
        const totalCrops = await Crop.countDocuments();
        const activeCrops = await Crop.countDocuments({ status: 'approved' });
        const pendingCrops = await Crop.countDocuments({ status: 'pending' });
        const soldCrops = await Crop.countDocuments({ status: 'sold' });

        // Order statistics
        const totalOrders = await Order.countDocuments();
        const completedOrders = await Order.countDocuments({ orderStatus: 'delivered' });
        const pendingOrders = await Order.countDocuments({
            orderStatus: { $in: ['placed', 'confirmed', 'processing', 'shipped'] },
        });

        // Revenue calculation
        const revenueData = await Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                },
            },
        ]);

        const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

        // Negotiation statistics
        const totalNegotiations = await Negotiation.countDocuments();
        const successfulNegotiations = await Negotiation.countDocuments({
            status: 'accepted',
        });

        // Seasonal crop distribution
        const seasonalDistribution = await Crop.aggregate([
            { $match: { status: 'approved' } },
            {
                $group: {
                    _id: '$season',
                    count: { $sum: 1 },
                },
            },
        ]);

        // Category distribution
        const categoryDistribution = await Crop.aggregate([
            { $match: { status: 'approved' } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                },
            },
        ]);

        res.json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    farmers: farmerCount,
                    wholesalers: wholesalerCount,
                    consumers: consumerCount,
                    verifiedFarmers,
                    verifiedWholesalers,
                },
                crops: {
                    total: totalCrops,
                    active: activeCrops,
                    pending: pendingCrops,
                    sold: soldCrops,
                },
                orders: {
                    total: totalOrders,
                    completed: completedOrders,
                    pending: pendingOrders,
                },
                revenue: {
                    total: totalRevenue,
                },
                negotiations: {
                    total: totalNegotiations,
                    successful: successfulNegotiations,
                    successRate:
                        totalNegotiations > 0
                            ? ((successfulNegotiations / totalNegotiations) * 100).toFixed(2)
                            : 0,
                },
                seasonalDistribution,
                categoryDistribution,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get seasonal demand reports
// @route   GET /api/admin/reports/seasonal
// @access  Private (Admin only)
export const getSeasonalReport = async (req, res) => {
    try {
        const { season, state } = req.query;

        let matchQuery = {};
        if (season) matchQuery.season = season;
        if (state) matchQuery['location.state'] = state;

        const report = await Crop.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: {
                        season: '$season',
                        category: '$category',
                        state: '$location.state',
                    },
                    totalListings: { $sum: 1 },
                    totalQuantity: { $sum: '$quantity.value' },
                    avgPrice: { $avg: '$expectedPrice' },
                    minPrice: { $min: '$expectedPrice' },
                    maxPrice: { $max: '$expectedPrice' },
                },
            },
            {
                $sort: { totalListings: -1 },
            },
        ]);

        res.json({
            success: true,
            data: report,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get price trends
// @route   GET /api/admin/reports/price-trends
// @access  Private (Admin only)
export const getPriceTrends = async (req, res) => {
    try {
        const { cropName, state, days = 30 } = req.query;

        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - parseInt(days));

        let matchQuery = {
            createdAt: { $gte: dateLimit },
        };

        if (cropName) matchQuery.name = cropName;
        if (state) matchQuery['location.state'] = state;

        const trends = await Crop.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: {
                        name: '$name',
                        date: {
                            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
                        },
                    },
                    avgPrice: { $avg: '$expectedPrice' },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { '_id.date': 1 },
            },
        ]);

        res.json({
            success: true,
            data: trends,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
