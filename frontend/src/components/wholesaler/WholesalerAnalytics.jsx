import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import {
    FaChartLine,
    FaShoppingCart,
    FaBoxes,
    FaRupeeSign,
    FaTrophy,
    FaCalendarAlt,
    FaArrowUp,
    FaArrowDown
} from 'react-icons/fa';
import { formatPrice } from '../../utils/cropData';

const WholesalerAnalytics = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState({
        totalOrders: 0,
        totalSpent: 0,
        activeNegotiations: 0,
        completedDeals: 0,
        monthlySpending: [],
        topCategories: [],
        recentOrders: [],
        savingsFromNegotiations: 0
    });

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            // Fetch wholesaler's orders and negotiations
            const [ordersRes, negotiationsRes] = await Promise.all([
                api.get('/orders/my-orders'),
                api.get('/negotiations')
            ]);

            const orders = ordersRes.data.data || [];
            const negotiations = negotiationsRes.data.data || [];

            // Calculate analytics
            const totalOrders = orders.length;
            const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
            const activeNegotiations = negotiations.filter(n => n.status === 'ongoing').length;
            const completedDeals = negotiations.filter(n => n.status === 'accepted').length;

            // Calculate savings from negotiations
            const savingsFromNegotiations = negotiations
                .filter(n => n.status === 'accepted')
                .reduce((sum, n) => {
                    const initialPrice = n.initialPrice || 0;
                    const finalPrice = n.finalAgreedPrice || 0;
                    return sum + (initialPrice - finalPrice);
                }, 0);

            // Monthly spending (last 6 months)
            const monthlySpending = calculateMonthlySpending(orders);

            // Top categories
            const topCategories = calculateTopCategories(orders);

            // Recent orders
            const recentOrders = orders.slice(0, 5);

            setAnalytics({
                totalOrders,
                totalSpent,
                activeNegotiations,
                completedDeals,
                monthlySpending,
                topCategories,
                recentOrders,
                savingsFromNegotiations
            });
        } catch (error) {
            console.error('Error loading analytics:', error);
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const calculateMonthlySpending = (orders) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        const monthlyData = [];

        for (let i = 5; i >= 0; i--) {
            const monthIndex = (currentMonth - i + 12) % 12;
            const monthOrders = orders.filter(order => {
                const orderMonth = new Date(order.createdAt).getMonth();
                return orderMonth === monthIndex;
            });
            const total = monthOrders.reduce((sum, order) => sum + order.totalAmount, 0);
            monthlyData.push({ month: months[monthIndex], amount: total });
        }

        return monthlyData;
    };

    const calculateTopCategories = (orders) => {
        const categoryMap = {};
        orders.forEach(order => {
            order.items?.forEach(item => {
                const category = item.crop?.category || 'Other';
                categoryMap[category] = (categoryMap[category] || 0) + item.totalPrice;
            });
        });

        return Object.entries(categoryMap)
            .map(([category, amount]) => ({ category, amount }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: '80vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div style={{ background: 'var(--gray-50)', minHeight: '100vh', paddingBottom: 'var(--spacing-12)' }}>
            <div className="container" style={{ marginTop: 'var(--spacing-6)' }}>
                {/* Header */}
                <div style={{ marginBottom: 'var(--spacing-8)' }}>
                    <h1 className="gradient-text" style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--spacing-2)' }}>
                        Analytics Dashboard
                    </h1>
                    <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-lg)' }}>
                        Track your purchasing performance and insights
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-4 gap-6" style={{ marginBottom: 'var(--spacing-8)' }}>
                    <div className="card-premium hover-lift">
                        <div className="flex items-center justify-between mb-3">
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: 'var(--radius-lg)',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white'
                            }}>
                                <FaShoppingCart size={24} />
                            </div>
                        </div>
                        <h3 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--spacing-1)' }}>
                            {analytics.totalOrders}
                        </h3>
                        <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>Total Orders</p>
                    </div>

                    <div className="card-premium hover-lift">
                        <div className="flex items-center justify-between mb-3">
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: 'var(--radius-lg)',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white'
                            }}>
                                <FaRupeeSign size={24} />
                            </div>
                        </div>
                        <h3 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--spacing-1)' }}>
                            {formatPrice(analytics.totalSpent)}
                        </h3>
                        <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>Total Spent</p>
                    </div>

                    <div className="card-premium hover-lift">
                        <div className="flex items-center justify-between mb-3">
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: 'var(--radius-lg)',
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white'
                            }}>
                                <FaChartLine size={24} />
                            </div>
                        </div>
                        <h3 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--spacing-1)' }}>
                            {analytics.activeNegotiations}
                        </h3>
                        <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>Active Negotiations</p>
                    </div>

                    <div className="card-premium hover-lift">
                        <div className="flex items-center justify-between mb-3">
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: 'var(--radius-lg)',
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white'
                            }}>
                                <FaTrophy size={24} />
                            </div>
                        </div>
                        <h3 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--spacing-1)' }}>
                            {analytics.completedDeals}
                        </h3>
                        <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>Completed Deals</p>
                    </div>
                </div>

                {/* Savings Card */}
                {analytics.savingsFromNegotiations > 0 && (
                    <div className="card-premium" style={{
                        marginBottom: 'var(--spacing-8)',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white'
                    }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-2)', color: 'white' }}>
                                    💰 Total Savings from Negotiations
                                </h3>
                                <p style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 700 }}>
                                    {formatPrice(analytics.savingsFromNegotiations)}
                                </p>
                                <p style={{ opacity: 0.9, marginTop: 'var(--spacing-2)' }}>
                                    You've saved this amount through successful price negotiations!
                                </p>
                            </div>
                            <FaArrowDown size={64} style={{ opacity: 0.3 }} />
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                    {/* Monthly Spending Chart */}
                    <div className="card-premium">
                        <h3 style={{ marginBottom: 'var(--spacing-6)' }}>
                            <FaCalendarAlt style={{ display: 'inline', marginRight: 'var(--spacing-2)' }} />
                            Monthly Spending Trend
                        </h3>
                        <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: 'var(--spacing-3)' }}>
                            {analytics.monthlySpending.map((data, index) => {
                                const maxAmount = Math.max(...analytics.monthlySpending.map(d => d.amount), 1);
                                const height = (data.amount / maxAmount) * 100;
                                return (
                                    <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)', fontWeight: 600 }}>
                                            {formatPrice(data.amount)}
                                        </div>
                                        <div style={{
                                            width: '100%',
                                            height: `${height}%`,
                                            minHeight: '20px',
                                            background: 'linear-gradient(to top, var(--primary-green), var(--accent-blue))',
                                            borderRadius: 'var(--radius-md)',
                                            transition: 'all 0.3s ease'
                                        }}></div>
                                        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--gray-700)' }}>
                                            {data.month}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Top Categories */}
                    <div className="card-premium">
                        <h3 style={{ marginBottom: 'var(--spacing-4)' }}>
                            <FaBoxes style={{ display: 'inline', marginRight: 'var(--spacing-2)' }} />
                            Top Purchase Categories
                        </h3>
                        {analytics.topCategories.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                                {analytics.topCategories.map((cat, index) => {
                                    const maxAmount = analytics.topCategories[0]?.amount || 1;
                                    const percentage = (cat.amount / maxAmount) * 100;
                                    return (
                                        <div key={index}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span style={{ fontWeight: 600 }}>{cat.category}</span>
                                                <span style={{ color: 'var(--primary-green)', fontWeight: 700 }}>
                                                    {formatPrice(cat.amount)}
                                                </span>
                                            </div>
                                            <div style={{
                                                width: '100%',
                                                height: '8px',
                                                background: 'var(--gray-200)',
                                                borderRadius: 'var(--radius-full)',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    width: `${percentage}%`,
                                                    height: '100%',
                                                    background: 'linear-gradient(90deg, var(--primary-green), var(--accent-blue))',
                                                    transition: 'width 0.5s ease'
                                                }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p style={{ color: 'var(--gray-600)', textAlign: 'center', padding: 'var(--spacing-8)' }}>
                                No purchase data available yet
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WholesalerAnalytics;
