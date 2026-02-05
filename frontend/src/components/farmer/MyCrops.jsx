import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaEye,
    FaToggleOn,
    FaToggleOff,
    FaSearch,
    FaFilter,
    FaExclamationTriangle,
    FaDownload,
} from 'react-icons/fa';
import api from '../../services/api';
import { formatPrice } from '../../utils/cartUtils';

const MyCrops = () => {
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCrops, setSelectedCrops] = useState([]);
    const [filters, setFilters] = useState({
        category: '',
        season: '',
        status: '',
        search: '',
    });
    const [showFilters, setShowFilters] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadCrops();
    }, [filters]);

    const loadCrops = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.category) params.append('category', filters.category);
            if (filters.season) params.append('season', filters.season);
            if (filters.status) params.append('status', filters.status);
            if (filters.search) params.append('search', filters.search);

            const response = await api.get(`/crops/my-crops?${params.toString()}`);
            setCrops(response.data.data || []);
        } catch (error) {
            console.error('Error loading crops:', error);
            toast.error('Failed to load crops');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (cropId, cropName) => {
        if (!window.confirm(`Are you sure you want to delete "${cropName}"?`)) {
            return;
        }

        try {
            await api.delete(`/crops/${cropId}`);
            toast.success('Crop deleted successfully');
            loadCrops();
        } catch (error) {
            console.error('Error deleting crop:', error);
            toast.error('Failed to delete crop');
        }
    };

    const handleToggleConsumerAvailability = async (cropId, currentStatus) => {
        try {
            await api.put(`/crops/${cropId}/toggle-consumer`, {
                availableForConsumers: !currentStatus,
            });
            toast.success(`Consumer availability ${!currentStatus ? 'enabled' : 'disabled'}`);
            loadCrops();
        } catch (error) {
            console.error('Error toggling availability:', error);
            toast.error('Failed to update availability');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedCrops.length === 0) {
            toast.warning('Please select crops to delete');
            return;
        }

        if (!window.confirm(`Delete ${selectedCrops.length} selected crops?`)) {
            return;
        }

        try {
            await api.post('/crops/bulk-delete', { cropIds: selectedCrops });
            toast.success(`${selectedCrops.length} crops deleted`);
            setSelectedCrops([]);
            loadCrops();
        } catch (error) {
            console.error('Error bulk deleting:', error);
            toast.error('Failed to delete crops');
        }
    };

    const handleExportCSV = async () => {
        try {
            const response = await api.get('/crops/export', {
                responseType: 'blob'
            });

            // Create a download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `my-crops-${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success('Crops exported successfully');
        } catch (error) {
            console.error('Error exporting crops:', error);
            toast.error('Failed to export crops');
        }
    };

    const toggleSelectCrop = (cropId) => {
        setSelectedCrops(prev =>
            prev.includes(cropId)
                ? prev.filter(id => id !== cropId)
                : [...prev, cropId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedCrops.length === crops.length) {
            setSelectedCrops([]);
        } else {
            setSelectedCrops(crops.map(crop => crop._id));
        }
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'approved':
            case 'active':
                return 'var(--success)';
            case 'pending':
                return 'var(--warning)';
            case 'sold':
                return 'var(--primary-green)';
            case 'rejected':
                return 'var(--error)';
            default:
                return 'var(--gray-500)';
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
                        <h1 className="gradient-text">My Crops</h1>
                        <p style={{ color: 'var(--gray-600)' }}>
                            {crops.length} {crops.length === 1 ? 'crop' : 'crops'} listed
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={handleExportCSV} className="btn btn-outline">
                            <FaDownload /> Export CSV
                        </button>
                        <Link to="/farmer/crops/new" className="btn btn-primary">
                            <FaPlus /> Add New Crop
                        </Link>
                    </div>
                </div>

                {/* Filters and Actions */}
                <div className="card-premium mb-6">
                    <div className="flex gap-4" style={{ flexWrap: 'wrap', marginBottom: selectedCrops.length > 0 ? 'var(--spacing-4)' : 0 }}>
                        {/* Search */}
                        <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                            <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Search crops..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                style={{ paddingLeft: '2.5rem' }}
                            />
                        </div>

                        {/* Filter Toggle */}
                        <button
                            className="btn btn-outline"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <FaFilter /> Filters
                        </button>

                        {/* Select All */}
                        <button
                            className="btn btn-outline"
                            onClick={toggleSelectAll}
                        >
                            {selectedCrops.length === crops.length ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>

                    {/* Expanded Filters */}
                    {showFilters && (
                        <div className="grid grid-cols-3 gap-4 mt-4" style={{ paddingTop: 'var(--spacing-4)', borderTop: '1px solid var(--gray-200)' }}>
                            <select
                                className="form-select"
                                value={filters.category}
                                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                            >
                                <option value="">All Categories</option>
                                <option value="Vegetables">Vegetables</option>
                                <option value="Fruits">Fruits</option>
                                <option value="Cereals">Cereals</option>
                                <option value="Pulses">Pulses</option>
                                <option value="Spices">Spices</option>
                            </select>

                            <select
                                className="form-select"
                                value={filters.season}
                                onChange={(e) => setFilters({ ...filters, season: e.target.value })}
                            >
                                <option value="">All Seasons</option>
                                <option value="Kharif">Kharif</option>
                                <option value="Rabi">Rabi</option>
                                <option value="Zaid">Zaid</option>
                                <option value="Year-Round">Year-Round</option>
                            </select>

                            <select
                                className="form-select"
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            >
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="active">Active</option>
                                <option value="sold">Sold</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    )}

                    {/* Bulk Actions */}
                    {selectedCrops.length > 0 && (
                        <div style={{ marginTop: 'var(--spacing-4)', paddingTop: 'var(--spacing-4)', borderTop: '1px solid var(--gray-200)' }}>
                            <div className="flex items-center gap-3">
                                <span style={{ fontWeight: 600 }}>{selectedCrops.length} selected</span>
                                <button
                                    onClick={handleBulkDelete}
                                    className="btn btn-sm"
                                    style={{ background: 'var(--error)', color: 'white' }}
                                >
                                    <FaTrash /> Delete Selected
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Crops Grid */}
                {crops.length === 0 ? (
                    <div className="card-premium text-center" style={{ padding: 'var(--spacing-12)' }}>
                        <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-4)' }}>🌾</div>
                        <h3>No crops listed yet</h3>
                        <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--spacing-6)' }}>
                            Start by adding your first crop to the marketplace
                        </p>
                        <Link to="/farmer/crops/new" className="btn btn-primary">
                            <FaPlus /> Add Your First Crop
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-6">
                        {crops.map((crop) => (
                            <div
                                key={crop._id}
                                className="card-premium hover-3d"
                                style={{ padding: 0, overflow: 'hidden', position: 'relative' }}
                            >
                                {/* Selection Checkbox */}
                                <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10 }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedCrops.includes(crop._id)}
                                        onChange={() => toggleSelectCrop(crop._id)}
                                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                    />
                                </div>

                                {/* Image */}
                                <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                                    <img
                                        src={crop.images?.[0] || `https://images.unsplash.com/photo-1${Math.floor(Math.random() * 1000000000)}?w=400&h=300&fit=crop`}
                                        alt={crop.name}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                        }}
                                    />

                                    {/* Status Badge */}
                                    <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                                        <span
                                            className="badge"
                                            style={{
                                                background: getStatusBadgeColor(crop.status),
                                                color: 'white',
                                            }}
                                        >
                                            {crop.status}
                                        </span>
                                    </div>

                                    {/* Low Stock Warning */}
                                    {crop.stockQuantity < 10 && crop.stockQuantity > 0 && (
                                        <div style={{ position: 'absolute', bottom: '10px', left: '10px' }}>
                                            <span className="badge badge-warning">
                                                <FaExclamationTriangle /> Low Stock
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div style={{ padding: 'var(--spacing-4)' }}>
                                    <h4 style={{ marginBottom: 'var(--spacing-2)' }}>{crop.name}</h4>
                                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-3)' }}>
                                        {crop.category} • {crop.season}
                                    </p>

                                    {/* Metrics */}
                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        <div style={{ padding: 'var(--spacing-2)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>Stock</p>
                                            <p style={{ fontWeight: 600, color: crop.stockQuantity === 0 ? 'var(--error)' : 'inherit' }}>
                                                {crop.stockQuantity} {crop.quantity.unit}
                                            </p>
                                        </div>
                                        <div style={{ padding: 'var(--spacing-2)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>Views</p>
                                            <p style={{ fontWeight: 600 }}>{crop.views || 0}</p>
                                        </div>
                                    </div>

                                    {/* Pricing */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>Wholesale</p>
                                            <p style={{ fontWeight: 700, color: 'var(--primary-green)' }}>
                                                {formatPrice(crop.expectedPrice)}
                                            </p>
                                        </div>
                                        {crop.consumerPrice && (
                                            <div className="text-right">
                                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>Consumer</p>
                                                <p style={{ fontWeight: 700, color: 'var(--primary-green)' }}>
                                                    {formatPrice(crop.consumerPrice)}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Consumer Availability Toggle */}
                                    <div className="flex items-center justify-between mb-3" style={{ padding: 'var(--spacing-2)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                                        <span style={{ fontSize: 'var(--font-size-sm)' }}>Consumer Marketplace</span>
                                        <button
                                            onClick={() => handleToggleConsumerAvailability(crop._id, crop.availableForConsumers)}
                                            className="btn btn-sm"
                                            style={{ background: 'transparent', border: 'none', fontSize: 'var(--font-size-xl)', color: crop.availableForConsumers ? 'var(--success)' : 'var(--gray-400)' }}
                                        >
                                            {crop.availableForConsumers ? <FaToggleOn /> : <FaToggleOff />}
                                        </button>
                                    </div>

                                    {/* Actions */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <Link
                                            to={`/farmer/crops/edit/${crop._id}`}
                                            className="btn btn-outline btn-sm"
                                        >
                                            <FaEdit /> Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(crop._id, crop.name)}
                                            className="btn btn-sm"
                                            style={{ background: 'var(--error)', color: 'white' }}
                                        >
                                            <FaTrash /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyCrops;
