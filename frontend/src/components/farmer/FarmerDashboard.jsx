import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import {
    FaPlus,
    FaBox,
    FaShoppingCart,
    FaChartLine,
    FaWarehouse,
    FaExclamationTriangle,
    FaClock,
    FaCheckCircle,
    FaRupeeSign,
} from 'react-icons/fa';
import { formatPrice } from '../../utils/cartUtils';

const FarmerDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalCrops: 0,
        activeCrops: 0,
        lowStockItems: 0,
        outOfStock: 0,
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [lowStockCrops, setLowStockCrops] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // Load crops, consumer orders, and wholesale orders in parallel
            const [cropsRes, consumerOrdersRes, wholesaleOrdersRes] = await Promise.all([
                api.get('/crops/my-crops'),
                api.get('/marketplace/farmer/orders').catch(() => ({ data: { data: [] } })),
                api.get('/wholesale-orders/farmer').catch(() => ({ data: { data: [] } })),
            ]);

            const crops = cropsRes.data.data || [];
            const consumerOrders = consumerOrdersRes.data.data || [];
            const wholesaleOrders = wholesaleOrdersRes.data.data || [];

            // Combine both order types
            const allOrders = [...consumerOrders, ...wholesaleOrders];

            // Filter completed (delivered) orders first
            const completedOrders = allOrders.filter(
                o => o.status === 'delivered' || o.orderStatus === 'delivered'
            );

            // Calculate revenue ONLY from completed/delivered orders
            const totalRevenue = completedOrders.reduce((sum, order) => {
                return sum + (order.farmerTotal || order.totalAmount || 0);
            }, 0);

            // Calculate pending revenue separately
            const pendingRevenue = allOrders
                .filter(o => o.status === 'pending' || o.orderStatus === 'pending')
                .reduce((sum, order) => sum + (order.farmerTotal || order.totalAmount || 0), 0);

            // Calculate stats
            const activeCrops = crops.filter(c => c.status === 'approved' || c.status === 'active');
            const lowStock = crops.filter(c => c.stockQuantity > 0 && c.stockQuantity < 10);
            const outOfStock = crops.filter(c => c.stockQuantity === 0);

            setStats({
                totalCrops: crops.length,
                activeCrops: activeCrops.length,
                lowStockItems: lowStock.length,
                outOfStock: outOfStock.length,
                totalRevenue,
                pendingRevenue,
                completedOrders: completedOrders.length,
                totalOrders: allOrders.length,
            });

            // Set recent orders (last 5, combined)
            const sortedOrders = allOrders.sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            );
            setRecentOrders(sortedOrders.slice(0, 5));

            // Set low stock items
            setLowStockCrops(lowStock.slice(0, 5));

        } catch (error) {
            console.error('Error loading dashboard:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'delivered':
                return 'var(--success)';
            case 'shipped':
            case 'out_for_delivery':
                return 'var(--primary-green)';
            case 'cancelled':
                return 'var(--error)';
            default:
                return 'var(--warning)';
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: '80vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', minHeight: '100vh', paddingTop: 'var(--spacing-8)', paddingBottom: 'var(--spacing-12)' }}>
            <div className="container">
                {/* Welcome Section */}
                <div className="mb-6">
                    <h1 className="gradient-text">Welcome back, {user.name}!</h1>
                    <p style={{ color: 'var(--gray-600)' }}>Here's what's happening with your farm today</p>

                    {!user.isVerified && (
                        <div style={{ marginTop: 'var(--spacing-4)', padding: 'var(--spacing-4)', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--warning)', borderRadius: 'var(--radius-lg)' }}>
                            <p style={{ color: 'var(--warning)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                                <FaExclamationTriangle /> Your account is pending verification. Some features may be limited until verified.
                            </p>
                        </div>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    {/* Total Revenue */}
                    <div className="card-premium" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
                        <div className="flex items-center justify-between mb-3">
                            <p style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9 }}>Total Earnings</p>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FaRupeeSign />
                            </div>
                        </div>
                        <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--spacing-1)' }}>
                            {formatPrice(stats.totalRevenue || 0)}
                        </p>
                        <p style={{ fontSize: 'var(--font-size-xs)', opacity: 0.8 }}>
                            {stats.completedOrders || 0} completed orders
                        </p>
                    </div>

                    {/* Pending Orders */}
                    <div className="card-premium" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white' }}>
                        <div className="flex items-center justify-between mb-3">
                            <p style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9 }}>Pending Orders</p>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FaClock />
                            </div>
                        </div>
                        <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--spacing-1)' }}>
                            {stats.totalOrders - stats.completedOrders || 0}
                        </p>
                        <p style={{ fontSize: 'var(--font-size-xs)', opacity: 0.8 }}>
                            Worth {formatPrice(stats.pendingRevenue || 0)}
                        </p>
                    </div>

                    {/* Total Crops */}
                    <Link to="/farmer/crops" className="card-premium hover-3d" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="flex items-center justify-between mb-3">
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>My Crops</p>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--green-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-green)' }}>
                                <FaBox />
                            </div>
                        </div>
                        <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--primary-green)', marginBottom: 'var(--spacing-1)' }}>
                            {stats.totalCrops}
                        </p>
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>
                            {stats.activeCrops} active listings
                        </p>
                    </Link>

                    {/* Low Stock */}
                    <Link to="/farmer/inventory" className="card-premium hover-3d" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="flex items-center justify-between mb-3">
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>Low Stock</p>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--orange-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)' }}>
                                <FaExclamationTriangle />
                            </div>
                        </div>
                        <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--warning)', marginBottom: 'var(--spacing-1)' }}>
                            {stats.lowStockItems}
                        </p>
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>
                            {stats.outOfStock} out of stock
                        </p>
                    </Link>
                </div>

                {/* Quick Actions */}
                <div className="card-premium mb-6">
                    <h3 style={{ marginBottom: 'var(--spacing-4)' }}>Quick Actions</h3>
                    <div className="grid grid-cols-4 gap-3">
                        <Link to="/farmer/crops/new" className="btn btn-primary">
                            <FaPlus /> List New Crop
                        </Link>
                        <Link to="/farmer/crops" className="btn btn-outline">
                            <FaBox /> Manage Crops
                        </Link>
                        <Link to="/farmer/inventory" className="btn btn-outline">
                            <FaWarehouse /> Update Inventory
                        </Link>
                        <Link to="/farmer/consumer-orders" className="btn btn-outline">
                            <FaShoppingCart /> View Orders
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    {/* Recent Orders (Consumer + Wholesale) */}
                    <div className="card-premium">
                        <div className="flex items-center justify-between mb-4">
                            <h3>Recent Orders</h3>
                            <Link to="/farmer/consumer-orders" className="btn btn-sm btn-outline">
                                View All
                            </Link>
                        </div>

                        {recentOrders.length === 0 ? (
                            <div className="text-center" style={{ padding: 'var(--spacing-8)' }}>
                                <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-2)' }}>📦</div>
                                <p style={{ color: 'var(--gray-600)' }}>No orders yet</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {recentOrders.map((order) => {
                                    const isWholesale = order.wholesaler || order.negotiation;
                                    const orderType = isWholesale ? 'Wholesale' : 'Consumer';
                                    const buyerName = isWholesale
                                        ? (order.wholesaler?.name || 'Wholesaler')
                                        : (order.buyer?.name || 'Customer');

                                    return (
                                        <div key={order._id} style={{ padding: 'var(--spacing-3)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                                            <div className="flex items-center justify-between mb-2">
                                                <div style={{ flex: 1 }}>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                                                            Order #{order.orderNumber}
                                                        </p>
                                                        <span
                                                            className="badge"
                                                            style={{
                                                                background: isWholesale ? 'var(--primary-green)' : 'var(--accent-blue)',
                                                                color: 'white',
                                                                fontSize: 'var(--font-size-xs)',
                                                                padding: '2px 8px'
                                                            }}
                                                        >
                                                            {orderType}
                                                        </span>
                                                    </div>
                                                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>
                                                        {buyerName} • {formatDate(order.createdAt)}
                                                    </p>
                                                </div>
                                                <span
                                                    className="badge"
                                                    style={{ background: getStatusBadgeColor(order.status || order.orderStatus), color: 'white', fontSize: 'var(--font-size-xs)' }}
                                                >
                                                    {(order.status || order.orderStatus).replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-700)' }}>
                                                    {isWholesale
                                                        ? `${order.quantity?.value || 0} ${order.quantity?.unit || ''}`
                                                        : `${order.items?.length || 0} items`
                                                    }
                                                </p>
                                                <p style={{ fontWeight: 700, color: 'var(--primary-green)' }}>
                                                    {formatPrice(order.farmerTotal || order.totalAmount)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Low Stock Alerts */}
                    <div className="card-premium">
                        <div className="flex items-center justify-between mb-4">
                            <h3>Low Stock Alerts</h3>
                            <Link to="/farmer/inventory" className="btn btn-sm btn-outline">
                                Manage Stock
                            </Link>
                        </div>

                        {lowStockCrops.length === 0 ? (
                            <div className="text-center" style={{ padding: 'var(--spacing-8)' }}>
                                <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-2)' }}>✅</div>
                                <p style={{ color: 'var(--gray-600)' }}>All items well stocked</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {lowStockCrops.map((crop) => (
                                    <div key={crop._id} style={{ padding: 'var(--spacing-3)', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid var(--warning)' }}>
                                        <div className="flex items-center gap-3">
                                            <div style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0 }}>
                                                <img
                                                    src={crop.images?.[0] || '/placeholder.jpg'}
                                                    alt={crop.name}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                                                    {crop.name}
                                                </p>
                                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>
                                                    {crop.category} • {crop.season}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p style={{ fontWeight: 700, color: 'var(--warning)', fontSize: 'var(--font-size-lg)' }}>
                                                    {crop.stockQuantity}
                                                </p>
                                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>
                                                    {crop.quantity.unit}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FarmerDashboard;
