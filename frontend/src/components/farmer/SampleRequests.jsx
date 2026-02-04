import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { getStatusBadgeClass, formatDate } from '../../utils/cropData';

const SampleRequests = () => {
    const [samples, setSamples] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSamples();
    }, []);

    const loadSamples = async () => {
        try {
            const response = await api.get('/samples/farmer');
            setSamples(response.data.data || []);
        } catch (error) {
            toast.error('Failed to load sample requests');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (sampleId, status) => {
        try {
            await api.put(`/samples/${sampleId}/status`, { status });
            toast.success(`Sample ${status} successfully`);
            loadSamples();
        } catch (error) {
            toast.error('Failed to update sample status');
        }
    };

    const handleStartNegotiation = async (sample) => {
        try {
            // Create negotiation from sample
            const response = await api.post('/negotiations', {
                cropId: sample.crop._id,
                wholesalerId: sample.wholesaler._id,
                sampleId: sample._id,
                initialQuantity: sample.requestedQuantity,
            });

            toast.success('Negotiation started! Redirecting...');
            // Redirect to negotiation detail page
            setTimeout(() => {
                window.location.href = `/farmer/negotiations/${response.data.data._id}`;
            }, 1000);
        } catch (error) {
            console.error('Start negotiation error:', error);
            toast.error(error.response?.data?.message || 'Failed to start negotiation');
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
        <div className="container" style={{ marginTop: 'var(--spacing-8)', marginBottom: 'var(--spacing-8)' }}>
            <h1 className="mb-6">Sample Requests</h1>

            {samples.length === 0 ? (
                <div className="card text-center p-8">
                    <p style={{ color: 'var(--gray-600)' }}>No sample requests yet.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {samples.map((sample) => (
                        <div key={sample._id} className="card">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3>{sample.crop?.name}</h3>
                                    <p style={{ color: 'var(--gray-600)' }}>
                                        Requested by: <strong>{sample.wholesaler?.name}</strong>
                                    </p>
                                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                        Quantity: {sample.requestedQuantity.value} {sample.requestedQuantity.unit}
                                    </p>
                                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                        Requested on: {formatDate(sample.createdAt)}
                                    </p>
                                    {sample.wholesalerNotes && (
                                        <p style={{ marginTop: 'var(--spacing-2)', fontStyle: 'italic' }}>
                                            Note: {sample.wholesalerNotes}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2 items-end">
                                    <span className={`badge ${getStatusBadgeClass(sample.status)}`}>
                                        {sample.status}
                                    </span>
                                    {sample.status === 'requested' && (
                                        <div className="flex gap-2">
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => handleStatusUpdate(sample._id, 'accepted')}
                                            >
                                                Accept
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleStatusUpdate(sample._id, 'rejected')}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                    {sample.status === 'accepted' && (
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => handleStatusUpdate(sample._id, 'sent')}
                                        >
                                            Mark as Sent
                                        </button>
                                    )}
                                    {sample.status === 'evaluated' && sample.qualityRating >= 3 && (
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => handleStartNegotiation(sample)}
                                        >
                                            Start Negotiation
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SampleRequests;
