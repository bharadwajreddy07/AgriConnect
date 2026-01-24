import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { getSeasonBadgeClass, formatPrice } from '../../utils/cropData';
import { FaLeaf, FaMapMarkerAlt, FaStar, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';

const ProductCatalog = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [filters, setFilters] = useState({
        location: 'Hyderabad',
        maxDistance: 100, // km
        minPrice: '',
        maxPrice: '',
        organicOnly: false,
        season: '',
    });

    useEffect(() => {
        // Debounce the filter changes to avoid reloading on every keystroke
        const timeoutId = setTimeout(() => {
            setProducts([]);
            setPage(1);
            setHasMore(true);
            loadProducts(1, true);
        }, 500); // Wait 500ms after user stops typing

        return () => clearTimeout(timeoutId);
    }, [filters.season, filters.organicOnly, filters.location]);

    // Price filter effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setProducts([]);
            setPage(1);
            setHasMore(true);
            loadProducts(1, true);
        }, 1000);
        return () => clearTimeout(timeoutId);
    }, [filters.minPrice, filters.maxPrice]);

    // Initial load
    useEffect(() => {
        loadProducts(1, true);
    }, []);

    const loadProducts = async (pageNum = 1, isNewFilter = false) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('status', 'approved');
            params.append('page', pageNum);
            params.append('limit', 20);

            if (filters.season) params.append('season', filters.season);
            if (filters.minPrice) params.append('minPrice', filters.minPrice);
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);

            const response = await api.get(`/crops?${params.toString()}`);
            let newProducts = response.data.data || [];

            // Filter by organic certification
            if (filters.organicOnly) {
                newProducts = newProducts.filter(p => p.organicCertified);
            }

            // Sort by distance (mock)
            newProducts.sort((a, b) => {
                const aDistance = calculateDistance(filters.location, a.location);
                const bDistance = calculateDistance(filters.location, b.location);
                return aDistance - bDistance;
            });

            if (isNewFilter) {
                setProducts(newProducts);
            } else {
                setProducts(prev => [...prev, ...newProducts]);
            }

            setHasMore(newProducts.length === 20); // Simple check for likely more pages

        } catch (error) {
            toast.error('Failed to load products');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadProducts(nextPage, false);
    };

    // Mock distance calculation (in production, use actual coordinates)
    const calculateDistance = (userLocation, cropLocation) => {
        const distances = {
            'Hyderabad': { 'Hyderabad': 0, 'Guntur': 250, 'Vijayawada': 270, 'Warangal': 140 },
        };
        return distances[userLocation]?.[cropLocation.district] || 500;
    };

    const handleAddToCart = (product) => {
        addToCart(product, 1);
        toast.success(`Added ${product.name} to cart!`);
    };

    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFilters({
            ...filters,
            [name]: type === 'checkbox' ? checked : value,
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
        <div style={{ background: 'var(--gray-50)', minHeight: '100vh', paddingBottom: 'var(--spacing-12)' }}>
            <div className="container" style={{ marginTop: 'var(--spacing-6)' }}>
                {/* Header */}
                <div style={{ marginBottom: 'var(--spacing-8)' }}>
                    <h1 style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--spacing-2)' }}>
                        Fresh Farm Produce
                    </h1>
                    <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-lg)' }}>
                        <FaMapMarkerAlt style={{ display: 'inline', marginRight: 'var(--spacing-2)' }} />
                        Showing products near {filters.location}
                    </p>
                </div>

                {/* Filters */}
                <div className="card" style={{ marginBottom: 'var(--spacing-6)', background: 'white' }}>
                    <h3 style={{ marginBottom: 'var(--spacing-4)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                        🔍 Filter Products
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Location</label>
                            <select
                                name="location"
                                className="form-select"
                                value={filters.location}
                                onChange={handleFilterChange}
                            >
                                <option value="Hyderabad">Hyderabad</option>
                                <option value="Bangalore">Bangalore</option>
                                <option value="Chennai">Chennai</option>
                                <option value="Mumbai">Mumbai</option>
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Min Price (₹)</label>
                            <input
                                type="number"
                                name="minPrice"
                                className="form-input"
                                placeholder="Min price"
                                value={filters.minPrice}
                                onChange={handleFilterChange}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Max Price (₹)</label>
                            <input
                                type="number"
                                name="maxPrice"
                                className="form-input"
                                placeholder="Max price"
                                value={filters.maxPrice}
                                onChange={handleFilterChange}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Season</label>
                            <select
                                name="season"
                                className="form-select"
                                value={filters.season}
                                onChange={handleFilterChange}
                            >
                                <option value="">All Seasons</option>
                                <option value="Kharif">Kharif</option>
                                <option value="Rabi">Rabi</option>
                                <option value="Zaid">Zaid</option>
                                <option value="Year-Round">Year-Round</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ marginTop: 'var(--spacing-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                name="organicOnly"
                                checked={filters.organicOnly}
                                onChange={handleFilterChange}
                                style={{ width: '18px', height: '18px' }}
                            />
                            <FaLeaf style={{ color: 'var(--success)' }} />
                            <span style={{ fontWeight: 500 }}>Show only Organic Certified products</span>
                        </label>

                        <button
                            className="btn btn-outline btn-sm"
                            onClick={() => setFilters({
                                location: 'Hyderabad',
                                maxDistance: 100,
                                minPrice: '',
                                maxPrice: '',
                                organicOnly: false,
                                season: '',
                            })}
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>

                {/* Results Count */}
                <div style={{ marginBottom: 'var(--spacing-4)' }}>
                    <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-lg)' }}>
                        Found <strong>{products.length}</strong> products
                    </p>
                </div>

                {/* Products Grid */}
                {products.length === 0 ? (
                    <div className="card text-center" style={{ padding: 'var(--spacing-12)', background: 'white' }}>
                        <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-4)' }}>🌾</div>
                        <h3 style={{ marginBottom: 'var(--spacing-2)' }}>No products found</h3>
                        <p style={{ color: 'var(--gray-600)' }}>
                            Try adjusting your filters or check back later for new listings
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-6">
                        {products.map((product) => {
                            const distance = calculateDistance(filters.location, product.location);

                            return (
                                <div
                                    key={product._id}
                                    className="card hover-lift"
                                    style={{
                                        background: 'white',
                                        border: product.organicCertified ? '2px solid var(--success)' : 'none',
                                        position: 'relative',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {/* Organic Badge */}
                                    {product.organicCertified && (
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: 'var(--spacing-3)',
                                                right: 'var(--spacing-3)',
                                                background: 'var(--success)',
                                                color: 'white',
                                                padding: 'var(--spacing-2) var(--spacing-3)',
                                                borderRadius: 'var(--radius-full)',
                                                fontSize: 'var(--font-size-xs)',
                                                fontWeight: 600,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 'var(--spacing-1)',
                                                zIndex: 10,
                                                boxShadow: 'var(--shadow-md)',
                                            }}
                                        >
                                            <FaLeaf /> ORGANIC
                                        </div>
                                    )}

                                    {/* Product Image */}
                                    {product.images && product.images[0] ? (
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="img-cover img-rounded"
                                            style={{ height: '200px', marginBottom: 'var(--spacing-4)' }}
                                        />
                                    ) : (
                                        <div
                                            style={{
                                                height: '200px',
                                                background: 'linear-gradient(135deg, #e0f2e9 0%, #c8e6d0 100%)',
                                                borderRadius: 'var(--radius-xl)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '4rem',
                                                marginBottom: 'var(--spacing-4)',
                                            }}
                                        >
                                            🌾
                                        </div>
                                    )}

                                    {/* Product Info */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 style={{ marginBottom: 0 }}>{product.name}</h3>
                                            <span className={`badge ${getSeasonBadgeClass(product.season)}`}>
                                                {product.season}
                                            </span>
                                        </div>

                                        <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-2)' }}>
                                            {product.category}
                                        </p>

                                        {/* Location & Distance */}
                                        <div style={{ marginBottom: 'var(--spacing-3)' }}>
                                            <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)' }}>
                                                <FaMapMarkerAlt style={{ color: 'var(--accent-orange)' }} />
                                                {product.location.district}, {product.location.state}
                                            </p>
                                            <p style={{ color: 'var(--accent-blue)', fontSize: 'var(--font-size-xs)', fontWeight: 500 }}>
                                                📍 ~{distance} km away
                                            </p>
                                        </div>

                                        {/* Quality Grade */}
                                        {product.qualityGrade && (
                                            <div style={{ marginBottom: 'var(--spacing-2)' }}>
                                                <span
                                                    className="badge"
                                                    style={{
                                                        background: 'rgba(245, 158, 11, 0.1)',
                                                        color: 'var(--warning)',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: 'var(--spacing-1)',
                                                    }}
                                                >
                                                    <FaStar /> {product.qualityGrade}
                                                </span>
                                            </div>
                                        )}

                                        {/* Price */}
                                        <div style={{ marginBottom: 'var(--spacing-3)' }}>
                                            <p
                                                style={{
                                                    fontWeight: 700,
                                                    fontSize: 'var(--font-size-2xl)',
                                                    color: 'var(--primary-green)',
                                                    marginBottom: 'var(--spacing-1)',
                                                }}
                                            >
                                                {formatPrice(product.expectedPrice)}
                                            </p>
                                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                                per {product.priceUnit || 'quintal'}
                                            </p>
                                        </div>

                                        {/* Availability */}
                                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-3)' }}>
                                            Available: <strong>{product.quantity.value} {product.quantity.unit}</strong>
                                        </p>

                                        {/* Add to Cart Button */}
                                        <button
                                            className="btn btn-primary"
                                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-2)' }}
                                            onClick={() => handleAddToCart(product)}
                                        >
                                            <FaShoppingCart /> Add to Cart
                                        </button>

                                        {/* Farmer Info */}
                                        <div
                                            style={{
                                                marginTop: 'var(--spacing-3)',
                                                paddingTop: 'var(--spacing-3)',
                                                borderTop: '1px solid var(--gray-200)',
                                            }}
                                        >
                                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>
                                                Farmer: <strong>{product.farmer?.name}</strong>
                                            </p>
                                            {product.farmer?.rating?.average > 0 && (
                                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)' }}>
                                                    <FaStar /> {product.farmer.rating.average.toFixed(1)} ({product.farmer.rating.count} reviews)
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductCatalog;
