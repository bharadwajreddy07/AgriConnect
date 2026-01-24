import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
    FaExclamationTriangle,
    FaCheckCircle,
    FaTimesCircle,
    FaEdit,
    FaSave,
    FaTimes,
    FaSearch,
    FaDownload,
} from 'react-icons/fa';
import api from '../../services/api';
import { formatPrice } from '../../utils/cartUtils';

const Inventory = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, low_stock, out_of_stock, in_stock
    const [searchQuery, setSearchQuery] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editStock, setEditStock] = useState('');

    useEffect(() => {
        loadInventory();
    }, []);

    const loadInventory = async () => {
        try {
            setLoading(true);
            const response = await api.get('/crops/my-crops');
            setInventory(response.data.data || []);
        } catch (error) {
            console.error('Error loading inventory:', error);
            toast.error('Failed to load inventory');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStock = async (cropId) => {
        if (!editStock || editStock < 0) {
            toast.error('Please enter a valid stock quantity');
            return;
        }

        try {
            await api.put(`/crops/${cropId}/stock`, {
                stockQuantity: parseInt(editStock),
            });
            toast.success('Stock updated successfully');
            setEditingId(null);
            setEditStock('');
            loadInventory();
        } catch (error) {
            console.error('Error updating stock:', error);
            toast.error('Failed to update stock');
        }
    };

    const getStockStatus = (stock) => {
        if (stock === 0) return 'out_of_stock';
        if (stock < 10) return 'low_stock';
        return 'in_stock';
    };

    const getStockBadge = (stock) => {
        const status = getStockStatus(stock);
        switch (status) {
            case 'out_of_stock':
                return { icon: <FaTimesCircle />, color: 'var(--error)', text: 'Out of Stock' };
            case 'low_stock':
                return { icon: <FaExclamationTriangle />, color: 'var(--warning)', text: 'Low Stock' };
            default:
                return { icon: <FaCheckCircle />, color: 'var(--success)', text: 'In Stock' };
        }
    };

    const exportInventory = () => {
        const csv = [
            ['Crop Name', 'Category', 'Stock Quantity', 'Unit', 'Status', 'Consumer Price', 'Wholesale Price'].join(','),
            ...filteredInventory.map(item => [
                item.name,
                item.category,
                item.stockQuantity,
                item.quantity.unit,
                getStockStatus(item.stockQuantity),
                item.consumerPrice || 'N/A',
                item.expectedPrice,
            ].join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success('Inventory exported successfully');
    };

    const filteredInventory = inventory.filter(item => {
        // Filter by stock status
        const status = getStockStatus(item.stockQuantity);
        if (filter === 'low_stock' && status !== 'low_stock') return false;
        if (filter === 'out_of_stock' && status !== 'out_of_stock') return false;
        if (filter === 'in_stock' && status !== 'in_stock') return false;

        // Filter by search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return item.name.toLowerCase().includes(query) || item.category.toLowerCase().includes(query);
        }

        return true;
    });

    const stats = {
        total: inventory.length,
        inStock: inventory.filter(i => getStockStatus(i.stockQuantity) === 'in_stock').length,
        lowStock: inventory.filter(i => getStockStatus(i.stockQuantity) === 'low_stock').length,
        outOfStock: inventory.filter(i => getStockStatus(i.stockQuantity) === 'out_of_stock').length,
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
                        <h1 className="gradient-text">Inventory Management</h1>
                        <p style={{ color: 'var(--gray-600)' }}>
                            Track and manage your crop stock levels
                        </p>
                    </div>
                    <button onClick={exportInventory} className="btn btn-outline">
                        <FaDownload /> Export CSV
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="card-premium">
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-2)' }}>
                            Total Items
                        </p>
                        <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--primary-green)' }}>
                            {stats.total}
                        </p>
                    </div>
                    <div className="card-premium">
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-2)' }}>
                            In Stock
                        </p>
                        <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--success)' }}>
                            {stats.inStock}
                        </p>
                    </div>
                    <div className="card-premium">
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-2)' }}>
                            Low Stock
                        </p>
                        <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--warning)' }}>
                            {stats.lowStock}
                        </p>
                    </div>
                    <div className="card-premium">
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-2)' }}>
                            Out of Stock
                        </p>
                        <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--error)' }}>
                            {stats.outOfStock}
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="card-premium mb-6">
                    <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                            <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Search crops..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ paddingLeft: '2.5rem' }}
                            />
                        </div>

                        <div className="flex gap-2">
                            {['all', 'in_stock', 'low_stock', 'out_of_stock'].map((filterOption) => (
                                <button
                                    key={filterOption}
                                    onClick={() => setFilter(filterOption)}
                                    className={`btn ${filter === filterOption ? 'btn-primary' : 'btn-outline'}`}
                                    style={{ textTransform: 'capitalize' }}
                                >
                                    {filterOption.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Inventory Table */}
                <div className="card-premium">
                    {filteredInventory.length === 0 ? (
                        <div className="text-center" style={{ padding: 'var(--spacing-8)' }}>
                            <p style={{ color: 'var(--gray-600)' }}>No items found</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--gray-200)' }}>
                                        <th style={{ padding: 'var(--spacing-3)', textAlign: 'left' }}>Crop</th>
                                        <th style={{ padding: 'var(--spacing-3)', textAlign: 'left' }}>Category</th>
                                        <th style={{ padding: 'var(--spacing-3)', textAlign: 'center' }}>Stock</th>
                                        <th style={{ padding: 'var(--spacing-3)', textAlign: 'center' }}>Status</th>
                                        <th style={{ padding: 'var(--spacing-3)', textAlign: 'right' }}>Consumer Price</th>
                                        <th style={{ padding: 'var(--spacing-3)', textAlign: 'right' }}>Wholesale Price</th>
                                        <th style={{ padding: 'var(--spacing-3)', textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredInventory.map((item) => {
                                        const badge = getStockBadge(item.stockQuantity);
                                        const isEditing = editingId === item._id;

                                        return (
                                            <tr key={item._id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                                                <td style={{ padding: 'var(--spacing-3)' }}>
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={item.images?.[0] || '/placeholder.jpg'}
                                                            alt={item.name}
                                                            style={{
                                                                width: '50px',
                                                                height: '50px',
                                                                objectFit: 'cover',
                                                                borderRadius: 'var(--radius-md)',
                                                            }}
                                                        />
                                                        <div>
                                                            <p style={{ fontWeight: 600 }}>{item.name}</p>
                                                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>
                                                                {item.season}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: 'var(--spacing-3)' }}>{item.category}</td>
                                                <td style={{ padding: 'var(--spacing-3)', textAlign: 'center' }}>
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            className="form-input"
                                                            value={editStock}
                                                            onChange={(e) => setEditStock(e.target.value)}
                                                            style={{ width: '100px', textAlign: 'center' }}
                                                            min="0"
                                                        />
                                                    ) : (
                                                        <span style={{ fontWeight: 600 }}>
                                                            {item.stockQuantity} {item.quantity.unit}
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={{ padding: 'var(--spacing-3)', textAlign: 'center' }}>
                                                    <span
                                                        className="badge"
                                                        style={{ background: badge.color, color: 'white' }}
                                                    >
                                                        {badge.icon} {badge.text}
                                                    </span>
                                                </td>
                                                <td style={{ padding: 'var(--spacing-3)', textAlign: 'right' }}>
                                                    {item.consumerPrice ? formatPrice(item.consumerPrice) : '-'}
                                                </td>
                                                <td style={{ padding: 'var(--spacing-3)', textAlign: 'right' }}>
                                                    {formatPrice(item.expectedPrice)}
                                                </td>
                                                <td style={{ padding: 'var(--spacing-3)', textAlign: 'center' }}>
                                                    {isEditing ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => handleUpdateStock(item._id)}
                                                                className="btn btn-sm btn-primary"
                                                            >
                                                                <FaSave />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingId(null);
                                                                    setEditStock('');
                                                                }}
                                                                className="btn btn-sm btn-outline"
                                                            >
                                                                <FaTimes />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                setEditingId(item._id);
                                                                setEditStock(item.stockQuantity.toString());
                                                            }}
                                                            className="btn btn-sm btn-outline"
                                                        >
                                                            <FaEdit /> Update
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Inventory;
