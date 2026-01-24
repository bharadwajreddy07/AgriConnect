import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { indianStates, seasons, cropCategories, qualityGrades, units } from '../../utils/cropData';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';

const EditCrop = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        season: '',
        quantity: { value: '', unit: 'quintal' },
        expectedPrice: '',
        priceUnit: 'per quintal',
        isNegotiable: true,
        location: {
            region: user.region || '',
            state: user.address?.state || '',
            district: user.address?.district || '',
            village: user.address?.village || '',
        },
        description: '',
        qualityGrade: 'Standard',
        organicCertified: false,
        harvestDate: '',
        // Consumer marketplace fields
        availableForConsumers: false,
        consumerPrice: '',
        stockQuantity: '',
    });

    useEffect(() => {
        loadCropData();
    }, [id]);

    const loadCropData = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/crops/${id}`);
            const crop = response.data.data;

            // Check if user owns this crop
            if (crop.farmer._id !== user._id) {
                toast.error('You do not have permission to edit this crop');
                navigate('/farmer/crops');
                return;
            }

            // Populate form with existing data
            setFormData({
                name: crop.name || '',
                category: crop.category || '',
                season: crop.season || '',
                quantity: {
                    value: crop.quantity?.value || '',
                    unit: crop.quantity?.unit || 'quintal',
                },
                expectedPrice: crop.expectedPrice || '',
                priceUnit: crop.priceUnit || 'per quintal',
                isNegotiable: crop.isNegotiable !== undefined ? crop.isNegotiable : true,
                location: {
                    region: crop.location?.region || user.region || '',
                    state: crop.location?.state || user.address?.state || '',
                    district: crop.location?.district || user.address?.district || '',
                    village: crop.location?.village || user.address?.village || '',
                },
                description: crop.description || '',
                qualityGrade: crop.qualityGrade || 'Standard',
                organicCertified: crop.organicCertified || false,
                harvestDate: crop.harvestDate ? new Date(crop.harvestDate).toISOString().split('T')[0] : '',
                availableForConsumers: crop.availableForConsumers || false,
                consumerPrice: crop.consumerPrice || '',
                stockQuantity: crop.stockQuantity || '',
            });
        } catch (error) {
            console.error('Error loading crop:', error);
            toast.error('Failed to load crop data');
            navigate('/farmer/crops');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.startsWith('quantity.')) {
            const field = name.split('.')[1];
            setFormData({
                ...formData,
                quantity: { ...formData.quantity, [field]: value },
            });
        } else if (name.startsWith('location.')) {
            const field = name.split('.')[1];
            setFormData({
                ...formData,
                location: { ...formData.location, [field]: value },
            });
        } else {
            setFormData({
                ...formData,
                [name]: type === 'checkbox' ? checked : value,
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await api.put(`/crops/${id}`, formData);
            toast.success('Crop updated successfully!');
            navigate('/farmer/crops');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update crop');
        } finally {
            setSaving(false);
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
            <div className="container" style={{ maxWidth: '900px' }}>
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate('/farmer/crops')}
                        className="btn btn-outline"
                        style={{ padding: 'var(--spacing-2)' }}
                    >
                        <FaArrowLeft />
                    </button>
                    <div>
                        <h1 className="gradient-text">Edit Crop</h1>
                        <p style={{ color: 'var(--gray-600)' }}>Update your crop listing details</p>
                    </div>
                </div>

                <div className="card-premium">
                    <form onSubmit={handleSubmit}>
                        {/* Basic Information */}
                        <div style={{ marginBottom: 'var(--spacing-6)' }}>
                            <h3 style={{ marginBottom: 'var(--spacing-4)', color: 'var(--primary-green)' }}>Basic Information</h3>

                            <div className="form-group">
                                <label className="form-label">Crop Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-input"
                                    placeholder="e.g., Wheat, Rice, Cotton"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="form-label">Category *</label>
                                    <select
                                        name="category"
                                        className="form-select"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {cropCategories.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Season *</label>
                                    <select
                                        name="season"
                                        className="form-select"
                                        value={formData.season}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Season</option>
                                        {seasons.map((season) => (
                                            <option key={season} value={season}>{season}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Quantity and Pricing */}
                        <div style={{ marginBottom: 'var(--spacing-6)' }}>
                            <h3 style={{ marginBottom: 'var(--spacing-4)', color: 'var(--primary-green)' }}>Quantity & Pricing</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="form-label">Total Quantity *</label>
                                    <input
                                        type="number"
                                        name="quantity.value"
                                        className="form-input"
                                        placeholder="Enter quantity"
                                        value={formData.quantity.value}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Unit *</label>
                                    <select
                                        name="quantity.unit"
                                        className="form-select"
                                        value={formData.quantity.unit}
                                        onChange={handleChange}
                                        required
                                    >
                                        {units.map((unit) => (
                                            <option key={unit} value={unit}>{unit}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="form-label">Wholesale Price (₹) *</label>
                                    <input
                                        type="number"
                                        name="expectedPrice"
                                        className="form-input"
                                        placeholder="Enter wholesale price"
                                        value={formData.expectedPrice}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Quality Grade</label>
                                    <select
                                        name="qualityGrade"
                                        className="form-select"
                                        value={formData.qualityGrade}
                                        onChange={handleChange}
                                    >
                                        {qualityGrades.map((grade) => (
                                            <option key={grade} value={grade}>{grade}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="isNegotiable"
                                            checked={formData.isNegotiable}
                                            onChange={handleChange}
                                        />
                                        <span>Price is negotiable</span>
                                    </label>
                                </div>

                                <div className="form-group">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="organicCertified"
                                            checked={formData.organicCertified}
                                            onChange={handleChange}
                                        />
                                        <span>Organic Certified</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Consumer Marketplace */}
                        <div style={{ marginBottom: 'var(--spacing-6)', padding: 'var(--spacing-4)', background: 'var(--green-50)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--green-200)' }}>
                            <h3 style={{ marginBottom: 'var(--spacing-4)', color: 'var(--primary-green)' }}>Consumer Marketplace</h3>

                            <div className="form-group">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="availableForConsumers"
                                        checked={formData.availableForConsumers}
                                        onChange={handleChange}
                                    />
                                    <span style={{ fontWeight: 600 }}>Make available in consumer marketplace</span>
                                </label>
                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginTop: 'var(--spacing-1)' }}>
                                    Enable this to sell directly to consumers
                                </p>
                            </div>

                            {formData.availableForConsumers && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="form-group">
                                        <label className="form-label">Consumer Price (₹/kg) *</label>
                                        <input
                                            type="number"
                                            name="consumerPrice"
                                            className="form-input"
                                            placeholder="Enter consumer price per kg"
                                            value={formData.consumerPrice}
                                            onChange={handleChange}
                                            required={formData.availableForConsumers}
                                            min="0"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Available Stock (kg) *</label>
                                        <input
                                            type="number"
                                            name="stockQuantity"
                                            className="form-input"
                                            placeholder="Enter stock in kg"
                                            value={formData.stockQuantity}
                                            onChange={handleChange}
                                            required={formData.availableForConsumers}
                                            min="0"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Location */}
                        <div style={{ marginBottom: 'var(--spacing-6)' }}>
                            <h3 style={{ marginBottom: 'var(--spacing-4)', color: 'var(--primary-green)' }}>Location</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="form-label">State *</label>
                                    <select
                                        name="location.state"
                                        className="form-select"
                                        value={formData.location.state}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select State</option>
                                        {indianStates.map((state) => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">District *</label>
                                    <input
                                        type="text"
                                        name="location.district"
                                        className="form-input"
                                        placeholder="Enter district"
                                        value={formData.location.district}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div style={{ marginBottom: 'var(--spacing-6)' }}>
                            <h3 style={{ marginBottom: 'var(--spacing-4)', color: 'var(--primary-green)' }}>Additional Information</h3>

                            <div className="form-group">
                                <label className="form-label">Harvest Date</label>
                                <input
                                    type="date"
                                    name="harvestDate"
                                    className="form-input"
                                    value={formData.harvestDate}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    name="description"
                                    className="form-textarea"
                                    placeholder="Describe your crop quality, storage conditions, etc."
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                <FaSave /> {saving ? 'Saving Changes...' : 'Save Changes'}
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => navigate('/farmer/crops')}
                                disabled={saving}
                            >
                                <FaTimes /> Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditCrop;
