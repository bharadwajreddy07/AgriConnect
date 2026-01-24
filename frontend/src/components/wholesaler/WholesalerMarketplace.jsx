import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FaSearch,
    FaFilter,
    FaMapMarkerAlt,
    FaStar,
    FaLeaf,
    FaFlask,
    FaHandshake,
} from 'react-icons/fa';
import api from '../../services/api';
import { formatPrice } from '../../utils/cartUtils';
import { indianStates, seasons, cropCategories, qualityGrades } from '../../utils/cropData';

const WholesalerMarketplace = () => {
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCrop, setSelectedCrop] = useState(null);
    const [showSampleModal, setShowSampleModal] = useState(false);
    const [filters, setFilters] = useState({
        category: '',
        season: '',
        state: '',
        minPrice: '',
        maxPrice: '',
        qualityGrade: '',
        organicOnly: false,
        search: '',
        sort: 'latest',
    });

    const [sampleRequest, setSampleRequest] = useState({
        requestedQuantity: { value: '', unit: 'kg' },
        deliveryAddress: {
            street: '',
            city: '',
            state: '',
            pincode: '',
        },
        wholesalerNotes: '',
    });

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        // Reset crops when filters change
        setCrops([]);
        setPage(1);
        setHasMore(true);
        loadCrops(1, true);
    }, [filters]);

    const loadCrops = async (pageNum = 1, isNewFilter = false) => {
        try {
            setLoading(true);
            const params = new URLSearchParams();

            params.append('page', pageNum);
            params.append('limit', 20);

            // Add filters
            if (filters.category) params.append('category', filters.category);
            if (filters.season) params.append('season', filters.season);
            if (filters.state) params.append('state', filters.state);
            if (filters.minPrice) params.append('minPrice', filters.minPrice);
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
            if (filters.qualityGrade) params.append('qualityGrade', filters.qualityGrade);
            if (filters.organicOnly) params.append('organicCertified', 'true');
            if (filters.search) params.append('search', filters.search);
            if (filters.sort) params.append('sort', filters.sort);

            // Only show approved crops
            params.append('status', 'approved');

            const response = await api.get(`/crops?${params.toString()}`);

            const newCrops = response.data.data || [];
            if (isNewFilter) {
                setCrops(newCrops);
            } else {
                setCrops(prev => [...prev, ...newCrops]);
            }

            setTotal(response.data.total);
            setHasMore(newCrops.length === 20); // If we got full limit, assumes more might exist (simplified)

        } catch (error) {
            console.error('Error loading crops:', error);
            toast.error('Failed to load crops');
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadCrops(nextPage, false);
    };

    const handleRequestSample = async (e) => {
        e.preventDefault();

        if (!sampleRequest.requestedQuantity.value) {
            toast.error('Please enter sample quantity');
            return;
        }

        try {
            await api.post('/samples/request', {
                cropId: selectedCrop._id,
                requestedQuantity: sampleRequest.requestedQuantity,
                deliveryAddress: sampleRequest.deliveryAddress,
                wholesalerNotes: sampleRequest.wholesalerNotes,
            });

            toast.success('Sample request sent successfully!');
            setShowSampleModal(false);
            setSampleRequest({
                requestedQuantity: { value: '', unit: 'kg' },
                deliveryAddress: { street: '', city: '', state: '', pincode: '' },
                wholesalerNotes: '',
            });
        } catch (error) {
            console.error('Error requesting sample:', error);
            toast.error(error.response?.data?.message || 'Failed to request sample');
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
                <div className="mb-6">
                    <h1 className="gradient-text">Crop Marketplace</h1>
                    <p style={{ color: 'var(--gray-600)' }}>
                        Browse and source quality crops directly from farmers
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="card-premium mb-6">
                    <div className="flex gap-4" style={{ flexWrap: 'wrap', marginBottom: showFilters ? 'var(--spacing-4)' : 0 }}>
                        {/* Search */}
                        <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                            <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Search crops or farmers..."
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

                        {/* Sort */}
                        <select
                            className="form-select"
                            value={filters.sort}
                            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                            style={{ width: '200px' }}
                        >
                            <option value="latest">Latest First</option>
                            <option value="price_low">Price: Low to High</option>
                            <option value="price_high">Price: High to Low</option>
                            <option value="quantity_high">Quantity: High to Low</option>
                        </select>
                    </div>

                    {/* Expanded Filters */}
                    {showFilters && (
                        <div style={{ paddingTop: 'var(--spacing-4)', borderTop: '1px solid var(--gray-200)' }}>
                            <div className="grid grid-cols-4 gap-4">
                                <select
                                    className="form-select"
                                    value={filters.category}
                                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                >
                                    <option value="">All Categories</option>
                                    {cropCategories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>

                                <select
                                    className="form-select"
                                    value={filters.season}
                                    onChange={(e) => setFilters({ ...filters, season: e.target.value })}
                                >
                                    <option value="">All Seasons</option>
                                    {seasons.map((season) => (
                                        <option key={season} value={season}>{season}</option>
                                    ))}
                                </select>

                                <select
                                    className="form-select"
                                    value={filters.state}
                                    onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                                >
                                    <option value="">All States</option>
                                    {indianStates.map((state) => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>

                                <select
                                    className="form-select"
                                    value={filters.qualityGrade}
                                    onChange={(e) => setFilters({ ...filters, qualityGrade: e.target.value })}
                                >
                                    <option value="">All Grades</option>
                                    {qualityGrades.map((grade) => (
                                        <option key={grade} value={grade}>{grade}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-4 mt-4">
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="Min Price"
                                    value={filters.minPrice}
                                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                />
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="Max Price"
                                    value={filters.maxPrice}
                                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                />
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={filters.organicOnly}
                                        onChange={(e) => setFilters({ ...filters, organicOnly: e.target.checked })}
                                    />
                                    <span>Organic Only</span>
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Count */}
                <p style={{ marginBottom: 'var(--spacing-4)', color: 'var(--gray-600)' }}>
                    {crops.length} {crops.length === 1 ? 'crop' : 'crops'} found
                </p>

                {/* Crops Grid */}
                {crops.length === 0 ? (
                    <div className="card-premium text-center" style={{ padding: 'var(--spacing-12)' }}>
                        <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-4)' }}>🌾</div>
                        <h3>No crops found</h3>
                        <p style={{ color: 'var(--gray-600)' }}>
                            Try adjusting your filters or search criteria
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-6">
                        {crops.map((crop) => (
                            <div key={crop._id} className="card-premium hover-3d" style={{ padding: 0, overflow: 'hidden' }}>
                                {/* Image */}
                                <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                                    <img
                                        src={crop.images?.[0] || '/placeholder.jpg'}
                                        alt={crop.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    {crop.organicCertified && (
                                        <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                                            <span className="badge badge-success">
                                                <FaLeaf /> Organic
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

                                    {/* Farmer Info */}
                                    <div style={{ marginBottom: 'var(--spacing-3)', padding: 'var(--spacing-2)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>Farmer</p>
                                        <p style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{crop.farmer?.name}</p>
                                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>
                                            <FaMapMarkerAlt /> {crop.location?.state}
                                        </p>
                                    </div>

                                    {/* Metrics */}
                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        <div>
                                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>Available</p>
                                            <p style={{ fontWeight: 600 }}>{crop.quantity.value} {crop.quantity.unit}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>Quality</p>
                                            <p style={{ fontWeight: 600 }}>{crop.qualityGrade}</p>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div style={{ marginBottom: 'var(--spacing-3)' }}>
                                        <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--primary-green)' }}>
                                            {formatPrice(crop.expectedPrice)}
                                        </p>
                                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>
                                            per {crop.quantity.unit}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedCrop(crop);
                                                setShowSampleModal(true);
                                            }}
                                            className="btn btn-outline btn-sm"
                                        >
                                            <FaFlask /> Sample
                                        </button>
                                        <Link
                                            to={`/wholesaler/negotiate/${crop._id}`}
                                            className="btn btn-primary btn-sm"
                                        >
                                            <FaHandshake /> Negotiate
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Sample Request Modal */}
                {showSampleModal && selectedCrop && (
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                        }}
                        onClick={() => setShowSampleModal(false)}
                    >
                        <div
                            className="card-premium"
                            style={{ maxWidth: '500px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 style={{ marginBottom: 'var(--spacing-4)' }}>Request Sample</h2>
                            <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--spacing-4)' }}>
                                {selectedCrop.name} from {selectedCrop.farmer?.name}
                            </p>

                            <form onSubmit={handleRequestSample}>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="form-group">
                                        <label className="form-label">Sample Quantity *</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={sampleRequest.requestedQuantity.value}
                                            onChange={(e) => setSampleRequest({
                                                ...sampleRequest,
                                                requestedQuantity: { ...sampleRequest.requestedQuantity, value: e.target.value }
                                            })}
                                            required
                                            min="1"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Unit *</label>
                                        <select
                                            className="form-select"
                                            value={sampleRequest.requestedQuantity.unit}
                                            onChange={(e) => setSampleRequest({
                                                ...sampleRequest,
                                                requestedQuantity: { ...sampleRequest.requestedQuantity, unit: e.target.value }
                                            })}
                                        >
                                            <option value="kg">kg</option>
                                            <option value="quintal">quintal</option>
                                            <option value="piece">piece</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Delivery Address</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Street Address"
                                        value={sampleRequest.deliveryAddress.street}
                                        onChange={(e) => setSampleRequest({
                                            ...sampleRequest,
                                            deliveryAddress: { ...sampleRequest.deliveryAddress, street: e.target.value }
                                        })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="City"
                                        value={sampleRequest.deliveryAddress.city}
                                        onChange={(e) => setSampleRequest({
                                            ...sampleRequest,
                                            deliveryAddress: { ...sampleRequest.deliveryAddress, city: e.target.value }
                                        })}
                                    />
                                    <select
                                        className="form-select"
                                        value={sampleRequest.deliveryAddress.state}
                                        onChange={(e) => setSampleRequest({
                                            ...sampleRequest,
                                            deliveryAddress: { ...sampleRequest.deliveryAddress, state: e.target.value }
                                        })}
                                    >
                                        <option value="">Select State</option>
                                        {indianStates.map((state) => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Notes (Optional)</label>
                                    <textarea
                                        className="form-textarea"
                                        rows="3"
                                        placeholder="Any specific requirements..."
                                        value={sampleRequest.wholesalerNotes}
                                        onChange={(e) => setSampleRequest({
                                            ...sampleRequest,
                                            wholesalerNotes: e.target.value
                                        })}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button type="submit" className="btn btn-primary flex-1">
                                        Send Request
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowSampleModal(false)}
                                        className="btn btn-outline flex-1"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WholesalerMarketplace;
