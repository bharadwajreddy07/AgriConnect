import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FaShoppingCart, FaHeart, FaStar, FaLeaf, FaFilter, FaSearch } from 'react-icons/fa';
import { addToCart as addToCartUtil, getCartCount, formatPrice } from '../../utils/cartUtils';

const ConsumerMarketplace = () => {
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cartCount, setCartCount] = useState(0);
    const [filters, setFilters] = useState({
        category: '',
        season: '',
        minPrice: '',
        maxPrice: '',
        search: '',
        sort: 'latest',
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        loadCrops();
        updateCartCount();
    }, [filters]);

    const loadCrops = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.category) params.append('category', filters.category);
            if (filters.season) params.append('season', filters.season);
            if (filters.minPrice) params.append('minPrice', filters.minPrice);
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
            if (filters.search) params.append('search', filters.search);
            if (filters.sort) params.append('sort', filters.sort);

            const res = await api.get(`/marketplace/crops?${params.toString()}`);
            setCrops(res.data.data || []);
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const updateCartCount = () => {
        setCartCount(getCartCount());
    };

    const addToCart = (crop) => {
        addToCartUtil(crop, 1);
        updateCartCount();
        toast.success(`${crop.name} added to cart!`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: '80vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', minHeight: '100vh', paddingBottom: 'var(--spacing-12)' }}>
            <div className="container" style={{ paddingTop: 'var(--spacing-8)' }}>
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="gradient-text">Fresh From Farm</h1>
                        <p style={{ color: 'var(--gray-600)' }}>Buy directly from verified farmers</p>
                    </div>
                    <Link
                        to="/consumer/cart"
                        className="btn btn-primary"
                        style={{ position: 'relative' }}
                    >
                        <FaShoppingCart />
                        <span>Cart</span>
                        {cartCount > 0 && (
                            <span
                                className="animate-pulse"
                                style={{
                                    position: 'absolute',
                                    top: '-8px',
                                    right: '-8px',
                                    background: 'var(--error)',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '24px',
                                    height: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 'var(--font-size-xs)',
                                    fontWeight: 700,
                                }}
                            >
                                {cartCount}
                            </span>
                        )}
                    </Link>
                </div>

                {/* Search and Filters */}
                <div className="card-premium mb-6">
                    <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
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

                        {/* Sort */}
                        <select
                            className="form-select"
                            value={filters.sort}
                            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                            style={{ width: 'auto' }}
                        >
                            <option value="latest">Latest</option>
                            <option value="price_low">Price: Low to High</option>
                            <option value="price_high">Price: High to Low</option>
                            <option value="popular">Most Popular</option>
                        </select>
                    </div>

                    {/* Expanded Filters */}
                    {showFilters && (
                        <div className="grid grid-cols-4 gap-4 mt-4" style={{ paddingTop: 'var(--spacing-4)', borderTop: '1px solid var(--gray-200)' }}>
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
                        </div>
                    )}
                </div>

                {/* Products Grid */}
                {crops.length === 0 ? (
                    <div className="card-premium text-center" style={{ padding: 'var(--spacing-12)' }}>
                        <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-4)' }}>🌾</div>
                        <h3>No products found</h3>
                        <p style={{ color: 'var(--gray-600)' }}>Try adjusting your filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-4 gap-6">
                        {crops.map((crop) => (
                            <div
                                key={crop._id}
                                className="card-premium hover-3d"
                                style={{ overflow: 'hidden', padding: 0 }}
                            >
                                {/* Image */}
                                <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                                    <img
                                        src={crop.images?.[0] || `https://images.unsplash.com/photo-1${Math.floor(Math.random() * 1000000000)}?w=400&h=300&fit=crop`}
                                        alt={crop.name}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            transition: 'transform 0.3s ease',
                                        }}
                                        onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
                                        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                                    />

                                    {/* Badges */}
                                    <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '8px', flexDirection: 'column' }}>
                                        {crop.organicCertified && (
                                            <span className="badge" style={{ background: 'var(--success)', color: 'white' }}>
                                                <FaLeaf /> Organic
                                            </span>
                                        )}
                                        <span className={`badge season-${crop.season.toLowerCase()}`}>
                                            {crop.season}
                                        </span>
                                    </div>

                                    {/* Stock Badge */}
                                    {crop.stockQuantity < 10 && (
                                        <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                                            <span className="badge badge-warning">
                                                Only {crop.stockQuantity} left!
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div style={{ padding: 'var(--spacing-4)' }}>
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h4 style={{ marginBottom: 'var(--spacing-1)' }}>{crop.name}</h4>
                                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                                {crop.category}
                                            </p>
                                        </div>
                                        <button
                                            className="btn btn-sm"
                                            style={{ background: 'transparent', border: 'none', color: 'var(--gray-400)' }}
                                        >
                                            <FaHeart />
                                        </button>
                                    </div>

                                    {/* Farmer Info */}
                                    <div className="flex items-center gap-2 mb-3" style={{ padding: 'var(--spacing-2)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                                        <div style={{
                                            width: '30px',
                                            height: '30px',
                                            borderRadius: '50%',
                                            background: 'var(--primary-green)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: 'var(--font-size-sm)',
                                            fontWeight: 'bold',
                                        }}>
                                            {crop.farmer?.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p style={{ fontSize: 'var(--font-size-xs)', fontWeight: 500, marginBottom: 0 }}>
                                                {crop.farmer?.name}
                                            </p>
                                            <div className="flex items-center gap-1">
                                                <FaStar style={{ color: '#fbbf24', fontSize: '0.7rem' }} />
                                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>
                                                    {crop.farmer?.rating || 4.5}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--primary-green)' }}>
                                                {formatPrice(crop.consumerPrice)}
                                            </div>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>
                                                per {crop.quantity.unit}
                                            </div>
                                        </div>
                                        <div className="badge badge-success">
                                            {crop.qualityGrade}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Link
                                            to={`/consumer/product/${crop._id}`}
                                            className="btn btn-outline flex-1"
                                            style={{ fontSize: 'var(--font-size-sm)' }}
                                        >
                                            View Details
                                        </Link>
                                        <button
                                            className="btn btn-primary flex-1"
                                            onClick={() => addToCart(crop)}
                                            style={{ fontSize: 'var(--font-size-sm)' }}
                                            disabled={crop.stockQuantity === 0}
                                        >
                                            <FaShoppingCart /> Add
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

export default ConsumerMarketplace;
