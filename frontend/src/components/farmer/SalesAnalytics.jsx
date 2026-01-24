import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
    FaRupeeSign,
    FaShoppingCart,
    FaUsers,
    FaTrophy,
    FaCalendar,
    FaDownload,
} from 'react-icons/fa';
import api from '../../services/api';
import { formatPrice } from '../../utils/cartUtils';

const SalesAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('month'); // week, month, year, all

    useEffect(() => {
        loadAnalytics();
    }, [dateRange]);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/analytics/farmer/sales?range=${dateRange}`);
            setAnalytics(response.data.data);
        } catch (error) {
            console.error('Error loading analytics:', error);
            toast.error('Failed to load analytics');
            // Mock data for development
            setAnalytics({
                revenue: {
                    total: 125000,
                    thisMonth: 45000,
                    thisWeek: 12000,
                    growth: 15.5,
                },
                orders: {
                    total: 156,
                    pending: 12,
                    completed: 132,
                    cancelled: 12,
                    avgValue: 801,
                },
                customers: {
                    total: 89,
                    repeat: 34,
                    repeatRate: 38.2,
                },
                topProducts: [
                    { name: 'Tomatoes', quantity: 450, revenue: 22500, category: 'Vegetables' },
                    { name: 'Potatoes', quantity: 380, revenue: 19000, category: 'Vegetables' },
                    { name: 'Onions', quantity: 320, revenue: 16000, category: 'Vegetables' },
                    { name: 'Mangoes', quantity: 250, revenue: 25000, category: 'Fruits' },
                    { name: 'Rice', quantity: 200, revenue: 18000, category: 'Cereals' },
                ],
                categoryBreakdown: [
                    { category: 'Vegetables', revenue: 57500, percentage: 46 },
                    { category: 'Fruits', revenue: 37500, percentage: 30 },
                    { category: 'Cereals', revenue: 25000, percentage: 20 },
                    { category: 'Pulses', revenue: 5000, percentage: 4 },
                ],
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: '80vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (!analytics) {
        return null;
    }

    return (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', minHeight: '100vh', paddingTop: 'var(--spacing-8)', paddingBottom: 'var(--spacing-12)' }}>
            <div className="container">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="gradient-text">Sales Analytics</h1>
                        <p style={{ color: 'var(--gray-600)' }}>
                            Track your performance and growth
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <select
                            className="form-select"
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                        >
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="year">This Year</option>
                            <option value="all">All Time</option>
                        </select>
                        <button className="btn btn-outline">
                            <FaDownload /> Export Report
                        </button>
                    </div>
                </div>

                {/* Revenue Cards */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="card-premium">
                        <div className="flex items-center justify-between mb-2">
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                Total Revenue
                            </p>
                            <div
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: 'var(--green-100)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--primary-green)',
                                }}
                            >
                                <FaRupeeSign />
                            </div>
                        </div>
                        <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--primary-green)', marginBottom: 'var(--spacing-1)' }}>
                            {formatPrice(analytics.revenue.total)}
                        </p>
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--success)' }}>
                            ↑ {analytics.revenue.growth}% from last period
                        </p>
                    </div>

                    <div className="card-premium">
                        <div className="flex items-center justify-between mb-2">
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                Total Orders
                            </p>
                            <div
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: 'var(--blue-100)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--primary-blue)',
                                }}
                            >
                                <FaShoppingCart />
                            </div>
                        </div>
                        <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, marginBottom: 'var(--spacing-1)' }}>
                            {analytics.orders.total}
                        </p>
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>
                            {analytics.orders.pending} pending
                        </p>
                    </div>

                    <div className="card-premium">
                        <div className="flex items-center justify-between mb-2">
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                Avg Order Value
                            </p>
                            <div
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: 'var(--purple-100)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--primary-purple)',
                                }}
                            >
                                <FaTrophy />
                            </div>
                        </div>
                        <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, marginBottom: 'var(--spacing-1)' }}>
                            {formatPrice(analytics.orders.avgValue)}
                        </p>
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>
                            per order
                        </p>
                    </div>

                    <div className="card-premium">
                        <div className="flex items-center justify-between mb-2">
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                Total Customers
                            </p>
                            <div
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: 'var(--orange-100)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--primary-orange)',
                                }}
                            >
                                <FaUsers />
                            </div>
                        </div>
                        <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, marginBottom: 'var(--spacing-1)' }}>
                            {analytics.customers.total}
                        </p>
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>
                            {analytics.customers.repeatRate}% repeat rate
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {/* Top Products */}
                    <div style={{ gridColumn: 'span 2' }}>
                        <div className="card-premium">
                            <h2 style={{ marginBottom: 'var(--spacing-4)' }}>Top Selling Products</h2>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid var(--gray-200)' }}>
                                            <th style={{ padding: 'var(--spacing-3)', textAlign: 'left' }}>Rank</th>
                                            <th style={{ padding: 'var(--spacing-3)', textAlign: 'left' }}>Product</th>
                                            <th style={{ padding: 'var(--spacing-3)', textAlign: 'center' }}>Quantity Sold</th>
                                            <th style={{ padding: 'var(--spacing-3)', textAlign: 'right' }}>Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analytics.topProducts.map((product, index) => (
                                            <tr key={index} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                                                <td style={{ padding: 'var(--spacing-3)' }}>
                                                    <div
                                                        style={{
                                                            width: '30px',
                                                            height: '30px',
                                                            borderRadius: '50%',
                                                            background: index < 3 ? 'var(--primary-green)' : 'var(--gray-200)',
                                                            color: index < 3 ? 'white' : 'var(--gray-600)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        {index + 1}
                                                    </div>
                                                </td>
                                                <td style={{ padding: 'var(--spacing-3)' }}>
                                                    <p style={{ fontWeight: 600 }}>{product.name}</p>
                                                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>
                                                        {product.category}
                                                    </p>
                                                </td>
                                                <td style={{ padding: 'var(--spacing-3)', textAlign: 'center', fontWeight: 600 }}>
                                                    {product.quantity}
                                                </td>
                                                <td style={{ padding: 'var(--spacing-3)', textAlign: 'right', fontWeight: 700, color: 'var(--primary-green)' }}>
                                                    {formatPrice(product.revenue)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Category Breakdown */}
                    <div>
                        <div className="card-premium">
                            <h2 style={{ marginBottom: 'var(--spacing-4)' }}>Category Breakdown</h2>
                            <div>
                                {analytics.categoryBreakdown.map((category, index) => (
                                    <div key={index} style={{ marginBottom: 'var(--spacing-4)' }}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span style={{ fontWeight: 600 }}>{category.category}</span>
                                            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                                {category.percentage}%
                                            </span>
                                        </div>
                                        <div
                                            style={{
                                                width: '100%',
                                                height: '8px',
                                                background: 'var(--gray-200)',
                                                borderRadius: 'var(--radius-full)',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: `${category.percentage}%`,
                                                    height: '100%',
                                                    background: 'var(--primary-green)',
                                                    transition: 'width 0.5s ease',
                                                }}
                                            />
                                        </div>
                                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginTop: 'var(--spacing-1)' }}>
                                            {formatPrice(category.revenue)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Status */}
                        <div className="card-premium mt-6">
                            <h3 style={{ marginBottom: 'var(--spacing-3)' }}>Order Status</h3>
                            <div className="grid gap-3">
                                <div className="flex items-center justify-between">
                                    <span style={{ fontSize: 'var(--font-size-sm)' }}>Completed</span>
                                    <span className="badge badge-success">{analytics.orders.completed}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span style={{ fontSize: 'var(--font-size-sm)' }}>Pending</span>
                                    <span className="badge badge-warning">{analytics.orders.pending}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span style={{ fontSize: 'var(--font-size-sm)' }}>Cancelled</span>
                                    <span className="badge badge-error">{analytics.orders.cancelled}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesAnalytics;
