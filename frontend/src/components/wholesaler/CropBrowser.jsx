import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { getSeasonBadgeClass, formatPrice, indianStates, seasons, cropCategories } from '../../utils/cropData';

const CropBrowser = () => {
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        season: '',
        state: '',
        category: '',
        search: '',
    });

    useEffect(() => {
        loadCrops();
    }, [filters]);

    const loadCrops = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.season) params.append('season', filters.season);
            if (filters.state) params.append('state', filters.state);
            if (filters.category) params.append('category', filters.category);
            if (filters.search) params.append('search', filters.search);

            const response = await api.get(`/crops?${params.toString()}`);
            setCrops(response.data.data || []);
        } catch (error) {
            toast.error('Failed to load crops');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleRequestSample = async (cropId) => {
        try {
            await api.post('/samples/request', {
                cropId,
                requestedQuantity: { value: 1, unit: 'kg' },
                deliveryAddress: {},
                wholesalerNotes: 'Interested in quality sample',
            });
            toast.success('Sample requested successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to request sample');
        }
    };

    return (
        <div className="container" style={{ marginTop: 'var(--spacing-8)', marginBottom: 'var(--spacing-8)' }}>
            <h1 className="mb-6">Browse Crops</h1>

            {/* Filters */}
            <div className="card mb-6">
                <h3 className="mb-4">Filters</h3>
                <div className="grid grid-cols-4 gap-4">
                    <div className="form-group">
                        <label className="form-label">Search</label>
                        <input
                            type="text"
                            name="search"
                            className="form-input"
                            placeholder="Search crops..."
                            value={filters.search}
                            onChange={handleFilterChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Season</label>
                        <select
                            name="season"
                            className="form-select"
                            value={filters.season}
                            onChange={handleFilterChange}
                        >
                            <option value="">All Seasons</option>
                            {seasons.map((season) => (
                                <option key={season} value={season}>{season}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">State</label>
                        <select
                            name="state"
                            className="form-select"
                            value={filters.state}
                            onChange={handleFilterChange}
                        >
                            <option value="">All States</option>
                            {indianStates.map((state) => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Category</label>
                        <select
                            name="category"
                            className="form-select"
                            value={filters.category}
                            onChange={handleFilterChange}
                        >
                            <option value="">All Categories</option>
                            {cropCategories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Crops Grid */}
            {loading ? (
                <div className="flex items-center justify-center" style={{ minHeight: '400px' }}>
                    <div className="spinner"></div>
                </div>
            ) : crops.length === 0 ? (
                <div className="card text-center p-8">
                    <p style={{ color: 'var(--gray-600)' }}>No crops found matching your filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-6">
                    {crops.map((crop) => (
                        <div key={crop._id} className="card hover-lift">
                            {crop.images && crop.images[0] && (
                                <img
                                    src={crop.images[0]}
                                    alt={crop.name}
                                    className="img-cover img-rounded"
                                    style={{ height: '200px', marginBottom: 'var(--spacing-4)' }}
                                />
                            )}

                            <div className="flex items-center gap-2 mb-2">
                                <h3>{crop.name}</h3>
                                <span className={`badge ${getSeasonBadgeClass(crop.season)}`}>
                                    {crop.season}
                                </span>
                            </div>

                            <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-2)' }}>
                                {crop.category}
                            </p>

                            <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--spacing-2)' }}>
                                📍 {crop.location.district}, {crop.location.state}
                            </p>

                            <p style={{ marginBottom: 'var(--spacing-2)' }}>
                                Quantity: <strong>{crop.quantity.value} {crop.quantity.unit}</strong>
                            </p>

                            <p style={{ fontWeight: 600, fontSize: 'var(--font-size-xl)', color: 'var(--primary-green)', marginBottom: 'var(--spacing-2)' }}>
                                {formatPrice(crop.expectedPrice)}
                                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 400, color: 'var(--gray-600)' }}>
                                    {' '}/{crop.priceUnit}
                                </span>
                            </p>

                            {crop.isNegotiable && (
                                <span className="badge badge-info mb-3">Negotiable</span>
                            )}

                            <div className="flex gap-2">
                                <button
                                    className="btn btn-primary btn-sm flex-1"
                                    onClick={() => handleRequestSample(crop._id)}
                                >
                                    Request Sample
                                </button>
                                <button className="btn btn-outline btn-sm">
                                    View Details
                                </button>
                            </div>

                            <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--gray-200)' }}>
                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                    Farmer: {crop.farmer?.name}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CropBrowser;
