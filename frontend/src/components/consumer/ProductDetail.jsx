import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FaShoppingCart,
    FaHeart,
    FaStar,
    FaLeaf,
    FaArrowLeft,
    FaMapMarkerAlt,
    FaPhone,
    FaCheckCircle,
} from 'react-icons/fa';
import api from '../../services/api';
import { addToCart as addToCartUtil, formatPrice } from '../../utils/cartUtils';

const ProductDetail = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [relatedProducts, setRelatedProducts] = useState([]);

    useEffect(() => {
        loadProduct();
    }, [productId]);

    const loadProduct = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/marketplace/crops/${productId}`);
            setProduct(response.data.data);
            setSelectedImage(0);

            // Load related products (same category)
            if (response.data.data.category) {
                loadRelatedProducts(response.data.data.category);
            }
        } catch (error) {
            console.error('Error loading product:', error);
            toast.error('Failed to load product details');
            navigate('/consumer/products');
        } finally {
            setLoading(false);
        }
    };

    const loadRelatedProducts = async (category) => {
        try {
            const response = await api.get(`/marketplace/crops?category=${category}&limit=4`);
            const products = response.data.data || [];
            // Filter out current product
            setRelatedProducts(products.filter(p => p._id !== productId).slice(0, 3));
        } catch (error) {
            console.error('Error loading related products:', error);
        }
    };

    const handleAddToCart = () => {
        if (quantity > product.stockQuantity) {
            toast.error(`Only ${product.stockQuantity} units available`);
            return;
        }

        addToCartUtil(product, quantity);
        toast.success(`${quantity} ${product.name} added to cart!`);
    };

    const handleBuyNow = () => {
        handleAddToCart();
        navigate('/consumer/cart');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: '80vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (!product) {
        return null;
    }

    const images = product.images && product.images.length > 0
        ? product.images
        : [`https://images.unsplash.com/photo-1${Math.floor(Math.random() * 1000000000)}?w=800&h=600&fit=crop`];

    return (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', minHeight: '100vh', paddingTop: 'var(--spacing-8)', paddingBottom: 'var(--spacing-12)' }}>
            <div className="container">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 mb-6" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                    <Link to="/consumer/products" style={{ color: 'var(--primary-green)' }}>Products</Link>
                    <span>/</span>
                    <span>{product.category}</span>
                    <span>/</span>
                    <span>{product.name}</span>
                </div>

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="btn btn-outline mb-6"
                >
                    <FaArrowLeft /> Back
                </button>

                <div className="grid grid-cols-3 gap-8">
                    {/* Image Gallery */}
                    <div style={{ gridColumn: 'span 2' }}>
                        <div className="card-premium" style={{ padding: 0, overflow: 'hidden' }}>
                            {/* Main Image */}
                            <div style={{ position: 'relative', height: '500px', overflow: 'hidden' }}>
                                <img
                                    src={images[selectedImage]}
                                    alt={product.name}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                    }}
                                />

                                {/* Badges */}
                                <div style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', gap: '10px', flexDirection: 'column' }}>
                                    {product.organicCertified && (
                                        <span className="badge" style={{ background: 'var(--success)', color: 'white', fontSize: 'var(--font-size-base)' }}>
                                            <FaLeaf /> Organic Certified
                                        </span>
                                    )}
                                    <span className={`badge season-${product.season.toLowerCase()}`} style={{ fontSize: 'var(--font-size-base)' }}>
                                        {product.season}
                                    </span>
                                    <span className="badge badge-success" style={{ fontSize: 'var(--font-size-base)' }}>
                                        {product.qualityGrade}
                                    </span>
                                </div>
                            </div>

                            {/* Thumbnail Gallery */}
                            {images.length > 1 && (
                                <div className="flex gap-3" style={{ padding: 'var(--spacing-4)' }}>
                                    {images.map((image, index) => (
                                        <div
                                            key={index}
                                            onClick={() => setSelectedImage(index)}
                                            style={{
                                                width: '100px',
                                                height: '100px',
                                                borderRadius: 'var(--radius-md)',
                                                overflow: 'hidden',
                                                cursor: 'pointer',
                                                border: selectedImage === index ? '3px solid var(--primary-green)' : '3px solid transparent',
                                                transition: 'all 0.3s ease',
                                            }}
                                        >
                                            <img
                                                src={image}
                                                alt={`${product.name} ${index + 1}`}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Details */}
                        <div className="card-premium mt-6">
                            <h2 style={{ marginBottom: 'var(--spacing-4)' }}>Product Details</h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-1)' }}>
                                        Category
                                    </p>
                                    <p style={{ fontWeight: 600 }}>{product.category}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-1)' }}>
                                        Season
                                    </p>
                                    <p style={{ fontWeight: 600 }}>{product.season}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-1)' }}>
                                        Quality Grade
                                    </p>
                                    <p style={{ fontWeight: 600 }}>{product.qualityGrade}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-1)' }}>
                                        Available Stock
                                    </p>
                                    <p style={{ fontWeight: 600, color: product.stockQuantity < 10 ? 'var(--error)' : 'var(--success)' }}>
                                        {product.stockQuantity} {product.quantity.unit}
                                    </p>
                                </div>
                            </div>

                            {product.description && (
                                <div style={{ marginTop: 'var(--spacing-4)', paddingTop: 'var(--spacing-4)', borderTop: '1px solid var(--gray-200)' }}>
                                    <h3 style={{ marginBottom: 'var(--spacing-2)' }}>Description</h3>
                                    <p style={{ color: 'var(--gray-700)', lineHeight: 1.6 }}>
                                        {product.description}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Farmer Information */}
                        <div className="card-premium mt-6">
                            <h2 style={{ marginBottom: 'var(--spacing-4)' }}>Farmer Information</h2>

                            <div className="flex items-start gap-4">
                                <div
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '50%',
                                        background: 'var(--primary-green)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: 'var(--font-size-3xl)',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    {product.farmer?.name?.charAt(0)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ marginBottom: 'var(--spacing-1)' }}>{product.farmer?.name}</h3>
                                    <div className="flex items-center gap-2 mb-2">
                                        <FaStar style={{ color: '#fbbf24' }} />
                                        <span style={{ fontWeight: 600 }}>{product.farmer?.rating || 4.5}</span>
                                        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                            (verified farmer)
                                        </span>
                                    </div>
                                    {product.farmer?.region && (
                                        <div className="flex items-center gap-2 mb-2">
                                            <FaMapMarkerAlt style={{ color: 'var(--gray-500)' }} />
                                            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-700)' }}>
                                                {product.farmer.region}
                                            </span>
                                        </div>
                                    )}
                                    {product.farmer?.phone && (
                                        <div className="flex items-center gap-2">
                                            <FaPhone style={{ color: 'var(--gray-500)' }} />
                                            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-700)' }}>
                                                {product.farmer.phone}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Purchase Options */}
                    <div>
                        <div className="card-premium" style={{ position: 'sticky', top: 'var(--spacing-4)' }}>
                            <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--spacing-2)' }}>
                                {product.name}
                            </h1>

                            {/* Price */}
                            <div style={{ marginBottom: 'var(--spacing-4)' }}>
                                <div style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 700, color: 'var(--primary-green)', marginBottom: 'var(--spacing-1)' }}>
                                    {formatPrice(product.consumerPrice)}
                                </div>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                    per {product.quantity.unit}
                                </div>
                            </div>

                            {/* Stock Status */}
                            <div style={{ marginBottom: 'var(--spacing-4)' }}>
                                {product.stockQuantity > 0 ? (
                                    <div className="flex items-center gap-2" style={{ color: 'var(--success)' }}>
                                        <FaCheckCircle />
                                        <span style={{ fontWeight: 600 }}>In Stock</span>
                                    </div>
                                ) : (
                                    <div style={{ color: 'var(--error)', fontWeight: 600 }}>
                                        Out of Stock
                                    </div>
                                )}
                            </div>

                            {/* Quantity Selector */}
                            {product.stockQuantity > 0 && (
                                <>
                                    <div style={{ marginBottom: 'var(--spacing-4)' }}>
                                        <label className="form-label">Quantity</label>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="btn btn-outline"
                                                style={{ width: '40px', height: '40px', padding: 0 }}
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                className="form-input text-center"
                                                value={quantity}
                                                onChange={(e) => setQuantity(Math.max(1, Math.min(product.stockQuantity, parseInt(e.target.value) || 1)))}
                                                min="1"
                                                max={product.stockQuantity}
                                                style={{ width: '80px' }}
                                            />
                                            <button
                                                onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                                                className="btn btn-outline"
                                                style={{ width: '40px', height: '40px', padding: 0 }}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)', marginTop: 'var(--spacing-2)' }}>
                                            {product.stockQuantity} units available
                                        </p>
                                    </div>

                                    {/* Total Price */}
                                    <div style={{ padding: 'var(--spacing-3)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-4)' }}>
                                        <div className="flex items-center justify-between">
                                            <span style={{ fontWeight: 600 }}>Total Price</span>
                                            <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--primary-green)' }}>
                                                {formatPrice(product.consumerPrice * quantity)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid gap-3">
                                        <button
                                            onClick={handleBuyNow}
                                            className="btn btn-primary btn-lg animate-pulse"
                                        >
                                            Buy Now
                                        </button>
                                        <button
                                            onClick={handleAddToCart}
                                            className="btn btn-outline btn-lg"
                                        >
                                            <FaShoppingCart /> Add to Cart
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* Delivery Info */}
                            <div style={{ marginTop: 'var(--spacing-4)', padding: 'var(--spacing-3)', background: 'var(--green-50)', borderRadius: 'var(--radius-md)' }}>
                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-700)', marginBottom: 'var(--spacing-2)' }}>
                                    <strong>Delivery:</strong> 3-5 business days
                                </p>
                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-700)' }}>
                                    <strong>Free delivery</strong> on orders above ₹1000
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div style={{ marginTop: 'var(--spacing-12)' }}>
                        <h2 style={{ marginBottom: 'var(--spacing-6)' }}>Related Products</h2>
                        <div className="grid grid-cols-3 gap-6">
                            {relatedProducts.map((relatedProduct) => (
                                <Link
                                    key={relatedProduct._id}
                                    to={`/consumer/product/${relatedProduct._id}`}
                                    className="card-premium hover-3d"
                                    style={{ padding: 0, overflow: 'hidden', textDecoration: 'none', color: 'inherit' }}
                                >
                                    <div style={{ height: '200px', overflow: 'hidden' }}>
                                        <img
                                            src={relatedProduct.images?.[0] || '/placeholder.jpg'}
                                            alt={relatedProduct.name}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                            }}
                                        />
                                    </div>
                                    <div style={{ padding: 'var(--spacing-4)' }}>
                                        <h4>{relatedProduct.name}</h4>
                                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-2)' }}>
                                            {relatedProduct.category}
                                        </p>
                                        <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--primary-green)' }}>
                                            {formatPrice(relatedProduct.consumerPrice)}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;
