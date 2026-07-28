import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ServiceForm from '../components/services/ServiceForm';
import { serviceAPI } from '../services/api';
import Card from '../components/common/Card';

const SERVICE_TYPE_CONFIG = {
  chef: { title: 'Edit Chef Listing', description: 'Update your chef service details' },
  caterer: { title: 'Edit Caterer Listing', description: 'Update your catering service details' },
  decorator: { title: 'Edit Decorator Listing', description: 'Update your decoration service details' },
};

const EditService = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadService();
  }, [id]);

  const loadService = async () => {
    try {
      const response = await serviceAPI.getById(id);
      const serviceData = response.data.service;
      
      if (user && serviceData.user_id !== user.id) {
        navigate('/services');
        return;
      }
      
      setService(serviceData);
    } catch (err) {
      console.error('Failed to load service:', err);
      navigate('/services');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    setSaving(true);
    setError('');

    try {
      await serviceAPI.update(id, formData);
      navigate(`/services/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update service');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 text-center">
        <h2 className="text-xl font-semibold text-gray-800">Service not found</h2>
      </div>
    );
  }

  const config = SERVICE_TYPE_CONFIG[service.service_type] || SERVICE_TYPE_CONFIG.chef;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{config.title}</h1>
        <p className="text-gray-600 mt-2">{config.description}</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <ServiceForm initialData={service} onSubmit={handleSubmit} loading={saving} serviceType={service.service_type} />
    </div>
  );
};

export default EditService;
