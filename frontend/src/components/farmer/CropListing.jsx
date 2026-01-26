import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { indianStates, seasons, cropCategories, qualityGrades, units } from '../../utils/cropData';

const CropListing = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
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
    });
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

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

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        if (files.length === 0) return;

        // Validate file types
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const invalidFiles = files.filter(file => !validTypes.includes(file.type));

        if (invalidFiles.length > 0) {
            toast.error('Please upload only JPG, PNG, or WebP images');
            return;
        }

        // Validate file sizes (max 5MB each)
        const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
        if (oversizedFiles.length > 0) {
            toast.error('Each image must be less than 5MB');
            return;
        }

        setImages(files);

        // Generate previews
        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user.isVerified) {
            toast.error('Your account must be verified to list crops');
            return;
        }

        if (images.length === 0) {
            toast.error('Please upload at least one image of your crop');
            return;
        }

        setLoading(true);

        try {
            const submitData = new FormData();

            // Append form data
            Object.keys(formData).forEach(key => {
                if (key === 'quantity' || key === 'location') {
                    submitData.append(key, JSON.stringify(formData[key]));
                } else {
                    submitData.append(key, formData[key]);
                }
            });

            // Append images
            images.forEach((image, index) => {
                submitData.append('images', image);
            });

            await api.post('/crops', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('Crop listed successfully! Waiting for admin approval.');
            navigate('/farmer');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to list crop');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '800px', marginTop: 'var(--spacing-8)', marginBottom: 'var(--spacing-8)' }}>
            <div className="card">
                <div className="card-header">
                    <h2>List New Crop</h2>
                    <p style={{ color: 'var(--gray-600)' }}>Fill in the details to list your crop for sale</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Basic Information */}
                    <h4 className="mb-4">Basic Information</h4>

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

                    {/* Quantity and Pricing */}
                    <h4 className="mb-4 mt-6">Quantity & Pricing</h4>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="form-label">Quantity *</label>
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
                            <label className="form-label">Wholesale Price (Expected) (₹) *</label>
                            <input
                                type="number"
                                name="expectedPrice"
                                className="form-input"
                                placeholder="Enter price"
                                value={formData.expectedPrice}
                                onChange={handleChange}
                                required
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Price Unit *</label>
                            <select
                                name="priceUnit"
                                className="form-select"
                                value={formData.priceUnit}
                                onChange={handleChange}
                                required
                            >
                                <option value="quintal">per quintal</option>
                                <option value="kg">per kg</option>
                                <option value="ton">per ton</option>
                                <option value="piece">per piece</option>
                                <option value="bunch">per bunch</option>
                            </select>
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

                    {/* Location */}
                    <h4 className="mb-4 mt-6">Location</h4>

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

                    {/* Additional Information */}
                    <h4 className="mb-4 mt-6">Additional Information</h4>

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
                        <label className="form-label">Crop Images * (Required)</label>
                        <input
                            type="file"
                            className="form-input"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            multiple
                            onChange={handleImageChange}
                            required
                        />
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)', marginTop: 'var(--spacing-2)' }}>
                            Upload clear images of your crop (JPG, PNG, or WebP, max 5MB each)
                        </p>

                        {imagePreviews.length > 0 && (
                            <div className="flex gap-3 mt-4" style={{ flexWrap: 'wrap' }}>
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} style={{ position: 'relative' }}>
                                        <img
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            style={{
                                                width: '120px',
                                                height: '120px',
                                                objectFit: 'cover',
                                                borderRadius: 'var(--radius-md)',
                                                border: '2px solid var(--gray-200)',
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
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

                    <div className="flex gap-4">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Listing Crop...' : 'List Crop'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => navigate('/farmer')}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CropListing;
