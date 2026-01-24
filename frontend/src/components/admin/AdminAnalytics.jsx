import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
    FaUsers,
    FaShoppingCart,
    FaRupeeSign,
    FaChartLine,
    FaSeedling,
    FaTruck,
} from 'react-icons/fa';
import api from '../../services/api';
import { formatPrice } from '../../utils/cartUtils';

const AdminAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('month');

    useEffect(() => {
        loadAnalytics();
    }, [timeRange]);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/analytics?range=${timeRange}`);
            setAnalytics(response.data.data);
        } catch (error) {
            console.error('Error loading analytics:', error);
            // Mock data for demonstration
            setAnalytics({
                users: {
                    total: 1247,
                    farmers: 456,
                    wholesalers: 234,
                    consumers: 557,
                    newThisMonth: 89,
                    verified: 892,
                },
                revenue: {
                    total: 4567890,
                    thisMonth: 567890,
                    growth: 23.5,
                    byCategory: [
                        { category: 'Vegetables', amount: 1234567 },
                        { category: 'Fruits', amount: 987654 },
                        { category: 'Cereals', amount: 876543 },
                        { category: 'Pulses', amount: 456789 },
                    ],
                },
                orders: {
                    total: 3456,
                    pending: 234,
                    completed: 2987,
                    cancelled: 235,
                    avgValue: 1320,
                },
                crops: {
                    total: 2345,
                    approved: 1987,
                    pending: 234,
                    rejected: 124,
                },
                activity: {
                    activeUsers: 567,
                    newListings: 123,
                    completedOrders: 89,
                },
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

    return (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', minHeight: '100vh', paddingTop: 'var(--spacing-8)', paddingBottom: 'var(--spacing-12)' }}>
            <div className="container">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="gradient-text">Platform Analytics</h1>
                        <p style={{ color: 'var(--gray-600)' }}>Overview of platform performance</p>
                    </div>
                    <select
                        className="form-select"
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        style={{ width: '200px' }}
                    >
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="year">This Year</option>
                        <option value="all">All Time</option>
                    </select>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="card-premium">
                        <div className="flex items-center justify-between mb-2">
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>Total Users</p>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--blue-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-blue)' }}>
                                <FaUsers />
                            </div>
                        </div>
                        <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--primary-blue)' }}>
                            {analytics.users.total.toLocaleString()}
                        </p>
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--success)' }}>
                            +{analytics.users.newThisMonth} this month
                        </p>
                    </div>

                    <div className="card-premium">
                        <div className="flex items-center justify-between mb-2">
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>Total Revenue</p>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--green-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-green)' }}>
                                <FaRupeeSign />
                            </div>
                        </div>
                        <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--primary-green)' }}>
                            {formatPrice(analytics.revenue.total)}
                        </p>
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--success)' }}>
                            ↑ {analytics.revenue.growth}% growth
                        </p>
                    </div>

                    <div className="card-premium">
                        <div className="flex items-center justify-between mb-2">
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>Total Orders</p>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--purple-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-purple)' }}>
                                <FaShoppingCart />
                            </div>
                        </div>
                        <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--primary-purple)' }}>
                            {analytics.orders.total.toLocaleString()}
                        </p>
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>
                            {analytics.orders.pending} pending
                        </p>
                    </div>

                    <div className="card-premium">
                        <div className="flex items-center justify-between mb-2">
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>Total Crops</p>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--orange-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-orange)' }}>
                                <FaSeedling />
                            </div>
                        </div>
                        <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--primary-orange)' }}>
                            {analytics.crops.total.toLocaleString()}
                        </p>
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--warning)' }}>
                            {analytics.crops.pending} pending approval
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {/* User Distribution */}
                    <div className="card-premium">
                        <h3 style={{ marginBottom: 'var(--spacing-4)' }}>User Distribution</h3>
                        <div className="grid gap-3">
                            <div className="flex items-center justify-between">
                                <span>Farmers</span>
                                <span style={{ fontWeight: 700 }}>{analytics.users.farmers}</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: 'var(--gray-200)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                                <div style={{ width: `${(analytics.users.farmers / analytics.users.total) * 100}%`, height: '100%', background: 'var(--primary-green)' }} />
                            </div>

                            <div className="flex items-center justify-between">
                                <span>Wholesalers</span>
                                <span style={{ fontWeight: 700 }}>{analytics.users.wholesalers}</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: 'var(--gray-200)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                                <div style={{ width: `${(analytics.users.wholesalers / analytics.users.total) * 100}%`, height: '100%', background: 'var(--primary-blue)' }} />
                            </div>

                            <div className="flex items-center justify-between">
                                <span>Consumers</span>
                                <span style={{ fontWeight: 700 }}>{analytics.users.consumers}</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: 'var(--gray-200)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                                <div style={{ width: `${(analytics.users.consumers / analytics.users.total) * 100}%`, height: '100%', background: 'var(--primary-purple)' }} />
                            </div>
                        </div>

                        <div style={{ marginTop: 'var(--spacing-4)', padding: 'var(--spacing-3)', background: 'var(--green-50)', borderRadius: 'var(--radius-md)' }}>
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-700)' }}>
                                <strong>{analytics.users.verified}</strong> verified users ({((analytics.users.verified / analytics.users.total) * 100).toFixed(1)}%)
                            </p>
                        </div>
                    </div>

                    {/* Revenue by Category */}
                    <div className="card-premium">
                        <h3 style={{ marginBottom: 'var(--spacing-4)' }}>Revenue by Category</h3>
                        <div className="grid gap-4">
                            {analytics.revenue.byCategory.map((cat, idx) => (
                                <div key={idx}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span style={{ fontWeight: 600 }}>{cat.category}</span>
                                        <span style={{ color: 'var(--primary-green)', fontWeight: 700 }}>
                                            {formatPrice(cat.amount)}
                                        </span>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', background: 'var(--gray-200)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                                        <div
                                            style={{
                                                width: `${(cat.amount / analytics.revenue.total) * 100}%`,
                                                height: '100%',
                                                background: 'var(--primary-green)',
                                                transition: 'width 0.5s ease',
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="card-premium">
                        <h3 style={{ marginBottom: 'var(--spacing-4)' }}>Recent Activity</h3>
                        <div className="grid gap-4">
                            <div style={{ padding: 'var(--spacing-3)', background: 'var(--blue-50)', borderRadius: 'var(--radius-md)' }}>
                                <div className="flex items-center gap-2 mb-1">
                                    <FaUsers style={{ color: 'var(--primary-blue)' }} />
                                    <p style={{ fontWeight: 600 }}>Active Users</p>
                                </div>
                                <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>
                                    {analytics.activity.activeUsers}
                                </p>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>
                                    in the last 24 hours
                                </p>
                            </div>

                            <div style={{ padding: 'var(--spacing-3)', background: 'var(--green-50)', borderRadius: 'var(--radius-md)' }}>
                                <div className="flex items-center gap-2 mb-1">
                                    <FaSeedling style={{ color: 'var(--primary-green)' }} />
                                    <p style={{ fontWeight: 600 }}>New Listings</p>
                                </div>
                                <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>
                                    {analytics.activity.newListings}
                                </p>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>
                                    this week
                                </p>
                            </div>

                            <div style={{ padding: 'var(--spacing-3)', background: 'var(--purple-50)', borderRadius: 'var(--radius-md)' }}>
                                <div className="flex items-center gap-2 mb-1">
                                    <FaTruck style={{ color: 'var(--primary-purple)' }} />
                                    <p style={{ fontWeight: 600 }}>Completed Orders</p>
                                </div>
                                <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>
                                    {analytics.activity.completedOrders}
                                </p>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>
                                    today
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Statistics */}
                <div className="card-premium mt-6">
                    <h3 style={{ marginBottom: 'var(--spacing-4)' }}>Order Statistics</h3>
                    <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-2)' }}>
                                Completed
                            </p>
                            <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--success)' }}>
                                {analytics.orders.completed}
                            </p>
                        </div>
                        <div className="text-center">
                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-2)' }}>
                                Pending
                            </p>
                            <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--warning)' }}>
                                {analytics.orders.pending}
                            </p>
                        </div>
                        <div className="text-center">
                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-2)' }}>
                                Cancelled
                            </p>
                            <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--error)' }}>
                                {analytics.orders.cancelled}
                            </p>
                        </div>
                        <div className="text-center">
                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-2)' }}>
                                Avg Order Value
                            </p>
                            <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--primary-green)' }}>
                                {formatPrice(analytics.orders.avgValue)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
