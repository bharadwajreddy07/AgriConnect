import Coupon from '../models/Coupon.js';

// @desc    Create new coupon
// @route   POST /api/admin/coupons
// @access  Private (Admin only)
export const createCoupon = async (req, res) => {
    try {
        const couponData = {
            ...req.body,
            createdBy: req.user._id,
        };

        const coupon = await Coupon.create(couponData);

        res.status(201).json({
            success: true,
            data: coupon,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Coupon code already exists' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all coupons
// @route   GET /api/admin/coupons
// @access  Private (Admin only)
export const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().populate('createdBy', 'name email').sort({ createdAt: -1 });

        res.json({
            success: true,
            count: coupons.length,
            data: coupons,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update coupon
// @route   PUT /api/admin/coupons/:id
// @access  Private (Admin only)
export const updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        res.json({
            success: true,
            data: coupon,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete coupon
// @route   DELETE /api/admin/coupons/:id
// @access  Private (Admin only)
export const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);

        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        res.json({
            success: true,
            message: 'Coupon deleted successfully',
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Validate and apply coupon
// @route   POST /api/coupons/validate
// @access  Private
export const validateCoupon = async (req, res) => {
    try {
        const { code, orderAmount, products } = req.body;

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return res.status(404).json({ message: 'Invalid coupon code' });
        }

        if (!coupon.isValid()) {
            return res.status(400).json({ message: 'Coupon is expired or inactive' });
        }

        // Check if applicable to products
        if (coupon.applicableProducts.length > 0) {
            const productIds = products.map((p) => p._id || p);
            const hasApplicableProduct = productIds.some((id) =>
                coupon.applicableProducts.some((ap) => ap.toString() === id.toString())
            );

            if (!hasApplicableProduct) {
                return res.status(400).json({ message: 'Coupon not applicable to selected products' });
            }
        }

        const discount = coupon.calculateDiscount(orderAmount);

        res.json({
            success: true,
            data: {
                code: coupon.code,
                discount,
                finalAmount: orderAmount - discount,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
