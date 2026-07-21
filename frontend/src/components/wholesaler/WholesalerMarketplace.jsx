import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FaSearch,
    FaFilter,
    FaMapMarkerAlt,
    FaLeaf,
    FaFlask,
    FaHandshake,
    FaShoppingCart,
    FaCheckCircle,
} from 'react-icons/fa';
import api from '../../services/api';
import { formatPrice } from '../../utils/cartUtils';
import { indianStates, seasons, cropCategories, qualityGrades, getCropImage } from '../../utils/cropData';
import { useWholesalerCart } from '../../context/WholesalerCartContext';
import { useI18n } from '../../i18n/i18n';

const WholesalerMarketplace = () => {
    const navigate = useNavigate();
    const { t } = useI18n();
    const { addDirectPurchaseToCart } = useWholesalerCart();
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCrop, setSelectedCrop] = useState(null);
    const [showSampleModal, setShowSampleModal] = useState(false);
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [buyQuantity, setBuyQuantity] = useState({ value: '', unit: 'quintal' });
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

            if (filters.category) params.append('category', filters.category);
            if (filters.season) params.append('season', filters.season);
            if (filters.state) params.append('state', filters.state);
            if (filters.minPrice) params.append('minPrice', filters.minPrice);
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
            if (filters.qualityGrade) params.append('qualityGrade', filters.qualityGrade);
            if (filters.organicOnly) params.append('organicCertified', 'true');
            if (filters.search) params.append('search', filters.search);
            if (filters.sort) params.append('sort', filters.sort);

            params.append('status', 'approved');

            const response = await api.get(`/crops?${params.toString()}`);

            const newCrops = response.data.data || [];
            if (isNewFilter) {
                setCrops(newCrops);
            } else {
                setCrops(prev => [...prev, ...newCrops]);
            }

            setTotal(response.data.total);
            setHasMore(newCrops.length === 20);

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

    const handleBuyNow = () => {
        if (!buyQuantity.value || parseFloat(buyQuantity.value) <= 0) {
            toast.error('Please enter a valid quantity');
            return;
        }

        addDirectPurchaseToCart(selectedCrop, buyQuantity);
        toast.success('Added to cart!');
        setShowBuyModal(false);
        setBuyQuantity({ value: '', unit: 'quintal' });

        setTimeout(() => {
            if (window.confirm('Item added to cart! Go to checkout now?')) {
                navigate('/wholesaler/cart');
            }
        }, 500);
    };

    if (loading && crops.length === 0) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: '80vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #f5fdf9 50%, #effaf3 100%)', minHeight: '100vh', paddingTop: 'var(--spacing-8)', paddingBottom: 'var(--spacing-12)' }}>
            <div className="container">
                {/* Header */}
                <div className="flex justify-between items-center mb-8" style={{ flexWrap: 'wrap', gap: 'var(--spacing-4)' }}>
                    <div>
                        <h1 className="gradient-text" style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--spacing-1)' }}>
                            {t('marketplace.title', 'Premium Crop Marketplace')}
                        </h1>
                        <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-base)' }}>
                            {t('marketplace.subtitle', 'Source directly from verified farmers with quality grades and sample testing')}
                        </p>
                    </div>

                    <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
                        <div className="glass-card" style={{ padding: 'var(--spacing-3) var(--spacing-5)', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', border: '1px solid var(--emerald-200)', background: 'var(--white)' }}>
                            <span style={{ fontSize: '1.5rem' }}>🌾</span>
                            <div>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)', margin: 0 }}>Active Listings</p>
                                <p style={{ fontWeight: 700, color: 'var(--gray-800)', margin: 0, fontSize: 'var(--font-size-lg)' }}>{total || crops.length}</p>
                            </div>
                        </div>
                        <div className="glass-card" style={{ padding: 'var(--spacing-3) var(--spacing-5)', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', border: '1px solid var(--amber-200)', background: 'var(--white)' }}>
                            <span style={{ fontSize: '1.5rem' }}>🤝</span>
                            <div>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)', margin: 0 }}>Farming Partners</p>
                                <p style={{ fontWeight: 700, color: 'var(--gray-800)', margin: 0, fontSize: 'var(--font-size-lg)' }}>Direct Sourced</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="card mb-8" style={{ border: '1px solid var(--gray-200)', background: 'var(--white)', padding: 'var(--spacing-5)', borderRadius: 'var(--radius-2xl)' }}>
                    <div className="flex gap-4 items-center" style={{ flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
                            <FaSearch style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-green)', fontSize: '1.1rem' }} />
                            <input
                                type="text"
                                className="form-input"
                                placeholder={t('marketplace.searchPlaceholder', 'Search by crop name, category, or state...')}
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                style={{ paddingLeft: '3rem', borderRadius: 'var(--radius-xl)', height: '48px', border: '1.5px solid var(--gray-200)' }}
                            />
                        </div>

                        <button
                            className={`btn ${showFilters ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setShowFilters(!showFilters)}
                            style={{ height: '48px', borderRadius: 'var(--radius-xl)', gap: 'var(--spacing-2)' }}
                        >
                            <FaFilter /> {t('marketplace.filters', 'Filter Options')}
                        </button>

                        <div style={{ width: '200px' }}>
                            <select
                                className="form-select"
                                value={filters.sort}
                                onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                                style={{ height: '48px', borderRadius: 'var(--radius-xl)', border: '1.5px solid var(--gray-200)' }}
                            >
                                <option value="latest">📅 {t('common.latest', 'Latest First')}</option>
                                <option value="price_low">📉 {t('common.price_low', 'Price: Low to High')}</option>
                                <option value="price_high">📈 {t('common.price_high', 'Price: High to Low')}</option>
                                <option value="quantity_high">⚖️ {t('common.quantity_high', 'Quantity: High to Low')}</option>
                            </select>
                        </div>
                    </div>

                    {showFilters && (
                        <div style={{ marginTop: 'var(--spacing-4)', paddingTop: 'var(--spacing-4)', borderTop: '1px solid var(--gray-100)' }}>
                            <div className="grid grid-cols-4 gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ fontWeight: 600 }}>{t('marketplace.category', 'Category')}</label>
                                    <select
                                        className="form-select"
                                        value={filters.category}
                                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                        style={{ borderRadius: 'var(--radius-lg)' }}
                                    >
                                        <option value="">{t('marketplace.allCategories', 'All Categories')}</option>
                                        {cropCategories.map((cat) => (
                                            <option key={cat} value={cat}>{t(`categories.${cat.toLowerCase()}`, cat)}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ fontWeight: 600 }}>{t('marketplace.season', 'Season')}</label>
                                    <select
                                        className="form-select"
                                        value={filters.season}
                                        onChange={(e) => setFilters({ ...filters, season: e.target.value })}
                                        style={{ borderRadius: 'var(--radius-lg)' }}
                                    >
                                        <option value="">{t('marketplace.allSeasons', 'All Seasons')}</option>
                                        {seasons.map((season) => (
                                            <option key={season} value={season}>{t(`seasons.${season.toLowerCase()}`, season)}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ fontWeight: 600 }}>{t('marketplace.state', 'State of Origin')}</label>
                                    <select
                                        className="form-select"
                                        value={filters.state}
                                        onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                                        style={{ borderRadius: 'var(--radius-lg)' }}
                                    >
                                        <option value="">{t('marketplace.allStates', 'All States')}</option>
                                        {indianStates.map((state) => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ fontWeight: 600 }}>{t('marketplace.qualityGrade', 'Quality Grade')}</label>
                                    <select
                                        className="form-select"
                                        value={filters.qualityGrade}
                                        onChange={(e) => setFilters({ ...filters, qualityGrade: e.target.value })}
                                        style={{ borderRadius: 'var(--radius-lg)' }}
                                    >
                                        <option value="">{t('marketplace.allGrades', 'All Grades')}</option>
                                        {qualityGrades.map((grade) => (
                                            <option key={grade} value={grade}>{grade}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-4" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
                                <div style={{ flex: 1, minWidth: '150px' }}>
                                    <label className="form-label" style={{ fontWeight: 600 }}>{t('marketplace.minPrice', 'Min Price (₹)')}</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="0"
                                        value={filters.minPrice}
                                        onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                        style={{ borderRadius: 'var(--radius-lg)' }}
                                    />
                                </div>
                                <div style={{ flex: 1, minWidth: '150px' }}>
                                    <label className="form-label" style={{ fontWeight: 600 }}>{t('marketplace.maxPrice', 'Max Price (₹)')}</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="No Limit"
                                        value={filters.maxPrice}
                                        onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                        style={{ borderRadius: 'var(--radius-lg)' }}
                                    />
                                </div>

                                <div className="flex items-center gap-2" style={{ marginTop: '24px', padding: '0.6rem 1rem', background: 'var(--emerald-50)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--emerald-200)', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        id="organic-certified"
                                        checked={filters.organicOnly}
                                        onChange={(e) => setFilters({ ...filters, organicOnly: e.target.checked })}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary-green)' }}
                                    />
                                    <label htmlFor="organic-certified" style={{ color: 'var(--emerald-900)', fontWeight: 600, fontSize: 'var(--font-size-sm)', cursor: 'pointer', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <FaLeaf style={{ color: 'var(--primary-green-light)' }} /> {t('marketplace.organicOnly', 'Organic Only')}
                                    </label>
                                </div>

                                <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => setFilters({
                                        category: '',
                                        season: '',
                                        state: '',
                                        minPrice: '',
                                        maxPrice: '',
                                        qualityGrade: '',
                                        organicOnly: false,
                                        search: '',
                                        sort: 'latest',
                                    })}
                                    style={{ marginTop: '24px', height: '38px', borderRadius: 'var(--radius-lg)' }}
                                >
                                    Reset Filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Count */}
                <p style={{ marginBottom: 'var(--spacing-4)', color: 'var(--gray-600)', fontWeight: 500 }}>
                    {crops.length} {crops.length === 1 ? t('marketplace.cropFound', 'crop found') : t('marketplace.cropsFound', 'crops found')}
                </p>

                {/* Crops Grid */}
                {crops.length === 0 ? (
                    <div className="card text-center" style={{ padding: 'var(--spacing-12)', background: 'var(--white)', borderRadius: 'var(--radius-2xl)', border: '1px solid var(--gray-200)' }}>
                        <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-4)' }}>🌾</div>
                        <h3>{t('marketplace.noCrops', 'No crops found')}</h3>
                        <p style={{ color: 'var(--gray-600)' }}>
                            {t('marketplace.noCropsDesc', 'Try adjusting your filters or search criteria')}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-3 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                            {crops.map((crop) => {
                                const gradeColors = {
                                    'A+': { bg: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', text: '#fff', border: 'none' },
                                    'A': { bg: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', text: '#fff', border: 'none' },
                                    'B': { bg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', text: '#fff', border: 'none' },
                                    'C': { bg: '#e5e7eb', text: '#374151', border: '1px solid var(--gray-300)' }
                                };
                                const gradeStyle = gradeColors[crop.qualityGrade] || { bg: '#e5e7eb', text: '#374151' };

                                return (
                                    <div
                                        key={crop._id}
                                        className="card hover-3d"
                                        style={{
                                            padding: 0,
                                            overflow: 'hidden',
                                            background: 'var(--white)',
                                            border: '1px solid var(--gray-200)',
                                            borderRadius: 'var(--radius-2xl)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                    >
                                        {/* Image Section */}
                                        <div style={{ position: 'relative', height: '220px', overflow: 'hidden', backgroundColor: 'var(--gray-100)' }}>
                                            <img
                                                src={getCropImage(crop.name)}
                                                alt={crop.name}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                }}
                                            />

                                            {/* Floating Badges */}
                                            <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap', zIndex: 10 }}>
                                                {crop.organicCertified && (
                                                    <span className="badge" style={{ background: 'var(--gradient-primary)', color: 'white', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: 'var(--shadow-sm)', fontSize: '0.7rem', padding: '4px 10px', textTransform: 'uppercase' }}>
                                                        <FaLeaf /> Organic
                                                    </span>
                                                )}
                                                <span className="badge" style={{ background: gradeStyle.bg, color: gradeStyle.text, border: gradeStyle.border, fontWeight: '700', fontSize: '0.75rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: 'var(--shadow-sm)' }}>
                                                    🌟 Grade {crop.qualityGrade}
                                                </span>
                                            </div>

                                            <div style={{ position: 'absolute', bottom: '12px', right: '12px', zIndex: 10 }}>
                                                <span className="badge" style={{ background: 'rgba(0,0,0,0.6)', color: 'white', backdropFilter: 'blur(4px)', fontSize: '0.75rem', padding: '4px 10px' }}>
                                                    {t(`seasons.${crop.season.toLowerCase()}`, crop.season)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div style={{ padding: 'var(--spacing-5)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--gray-900)', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                                                    {crop.name}
                                                </h3>
                                                <span style={{ fontSize: 'var(--font-size-xs)', background: 'var(--gray-100)', color: 'var(--gray-600)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 500 }}>
                                                    {t(`categories.${crop.category.toLowerCase()}`, crop.category)}
                                                </span>
                                            </div>

                                            {/* Farmer Avatar & Info Row */}
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                background: 'var(--gray-50)',
                                                border: '1px solid var(--gray-100)',
                                                padding: '10px 12px',
                                                borderRadius: 'var(--radius-xl)',
                                                marginBottom: 'var(--spacing-4)'
                                            }}>
                                                <div style={{
                                                    width: '38px',
                                                    height: '38px',
                                                    borderRadius: '50%',
                                                    background: 'var(--gradient-primary)',
                                                    color: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 700,
                                                    fontSize: '1rem',
                                                    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.2)'
                                                }}>
                                                    {crop.farmer?.name?.charAt(0).toUpperCase() || 'F'}
                                                </div>
                                                <div style={{ overflow: 'hidden' }}>
                                                    <p style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', margin: 0, color: 'var(--gray-800)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                                        {crop.farmer?.name}
                                                    </p>
                                                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)', margin: 0, display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                        <FaMapMarkerAlt style={{ color: 'var(--error)' }} /> {crop.location?.city || crop.location?.state}, {crop.location?.state}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Crop Metrics Row */}
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 1fr',
                                                gap: '12px',
                                                marginBottom: 'var(--spacing-4)',
                                                borderBottom: '1px dashed var(--gray-200)',
                                                paddingBottom: 'var(--spacing-4)'
                                            }}>
                                                <div>
                                                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-400)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stock Available</span>
                                                    <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--gray-800)' }}>
                                                        {crop.quantity.value} <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--gray-500)' }}>{crop.quantity.unit}s</span>
                                                    </span>
                                                </div>
                                                <div>
                                                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-400)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Min. Order</span>
                                                    <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--gray-800)' }}>
                                                        1 <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--gray-500)' }}>{crop.quantity.unit}</span>
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Price and Action Section */}
                                            <div style={{ marginTop: 'auto' }}>
                                                <div className="flex justify-between items-end mb-4">
                                                    <div>
                                                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-400)', textTransform: 'uppercase', display: 'block' }}>Expected Price</span>
                                                        <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-green)', lineHeight: 1.1 }}>
                                                            {formatPrice(crop.expectedPrice)}
                                                        </span>
                                                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>
                                                            {' '}/ {crop.quantity.unit}
                                                        </span>
                                                    </div>

                                                    <span style={{ fontSize: '0.75rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600, background: 'var(--emerald-50)', padding: '3px 8px', borderRadius: 'var(--radius-full)' }}>
                                                        <FaCheckCircle /> Seller Verified
                                                    </span>
                                                </div>

                                                {/* Actions grid */}
                                                <div className="grid gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedCrop(crop);
                                                            setBuyQuantity({ value: crop.quantity.value, unit: crop.quantity.unit });
                                                            setShowBuyModal(true);
                                                        }}
                                                        className="btn btn-primary"
                                                        style={{ background: 'var(--gradient-primary)', width: '100%', borderRadius: 'var(--radius-xl)', height: '42px', gap: '8px', fontSize: 'var(--font-size-sm)' }}
                                                    >
                                                        <FaShoppingCart /> Buy Bulk Now
                                                    </button>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedCrop(crop);
                                                                setShowSampleModal(true);
                                                            }}
                                                            className="btn btn-outline"
                                                            style={{ borderRadius: 'var(--radius-xl)', height: '38px', fontSize: 'var(--font-size-xs)', padding: '0.4rem' }}
                                                        >
                                                            <FaFlask /> Request Sample
                                                        </button>
                                                        <Link
                                                            to={`/wholesaler/negotiate/${crop._id}`}
                                                            className="btn btn-secondary"
                                                            style={{ borderRadius: 'var(--radius-xl)', height: '38px', fontSize: 'var(--font-size-xs)', padding: '0.4rem', color: 'white' }}
                                                        >
                                                            <FaHandshake /> Start Negotiate
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Load More */}
                        {hasMore && (
                            <div className="text-center mt-8">
                                <button
                                    onClick={handleLoadMore}
                                    className="btn btn-outline"
                                    style={{ minWidth: '200px', borderRadius: 'var(--radius-xl)' }}
                                >
                                    Load More Crops
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Sample Request Modal */}
                {showSampleModal && selectedCrop && (
                    <div className="modal-overlay" onClick={() => setShowSampleModal(false)}>
                        <div className="modal-content glass-modal" onClick={(e) => e.stopPropagation()}>
                            <h2 style={{ marginBottom: 'var(--spacing-2)' }}>Request Sample</h2>
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

                {/* Buy Now Modal */}
                {showBuyModal && selectedCrop && (
                    <div className="modal-overlay" onClick={() => setShowBuyModal(false)}>
                        <div className="modal-content glass-modal" onClick={(e) => e.stopPropagation()}>
                            <h2 style={{ marginBottom: 'var(--spacing-2)' }}>Quick Purchase</h2>
                            <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--spacing-4)' }}>
                                {selectedCrop.name} from {selectedCrop.farmer?.name}
                            </p>

                            <div style={{ padding: 'var(--spacing-3)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-4)', border: '1px solid var(--gray-200)' }}>
                                <div className="flex justify-between mb-2">
                                    <span style={{ color: 'var(--gray-600)' }}>Price per {selectedCrop.quantity.unit}</span>
                                    <span style={{ fontWeight: 700, color: 'var(--primary-green)' }}>{formatPrice(selectedCrop.expectedPrice)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span style={{ color: 'var(--gray-600)' }}>Available</span>
                                    <span style={{ fontWeight: 600 }}>{selectedCrop.quantity.value} {selectedCrop.quantity.unit}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="form-group">
                                    <label className="form-label">Quantity *</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={buyQuantity.value}
                                        onChange={(e) => setBuyQuantity({ ...buyQuantity, value: e.target.value })}
                                        min="1"
                                        max={selectedCrop.quantity.value}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Unit *</label>
                                    <select
                                        className="form-select"
                                        value={buyQuantity.unit}
                                        onChange={(e) => setBuyQuantity({ ...buyQuantity, unit: e.target.value })}
                                    >
                                        <option value="kg">kg</option>
                                        <option value="quintal">quintal</option>
                                        <option value="ton">ton</option>
                                    </select>
                                </div>
                            </div>

                            {buyQuantity.value && (
                                <div style={{ padding: 'var(--spacing-3)', background: 'var(--emerald-50)', border: '1px solid var(--emerald-200)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-4)' }}>
                                    <div className="flex justify-between">
                                        <span style={{ fontWeight: 600, color: 'var(--emerald-900)' }}>Estimated Total</span>
                                        <span style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)', color: 'var(--primary-green)' }}>
                                            {formatPrice(selectedCrop.expectedPrice * parseFloat(buyQuantity.value || 0))}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button onClick={handleBuyNow} className="btn btn-primary flex-1">
                                    <FaShoppingCart /> Add to Cart
                                </button>
                                <button
                                    onClick={() => setShowBuyModal(false)}
                                    className="btn btn-outline flex-1"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WholesalerMarketplace;
