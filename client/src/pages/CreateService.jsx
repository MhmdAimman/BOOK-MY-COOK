import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ServiceForm from '../components/services/ServiceForm';
import { serviceAPI } from '../services/api';
import Card from '../components/common/Card';

const SERVICE_TYPE_CONFIG = {
  chef: {
    title: 'Create Chef Listing',
    description: 'Showcase your culinary skills and attract clients for events',
  },
  caterer: {
    title: 'Create Caterer Listing',
    description: 'Offer professional catering services for weddings and events',
  },
  decorator: {
    title: 'Create Decorator Listing',
    description: 'Showcase your decoration services and transform events',
  },
};

const CreateService = () => {
  const navigate = useNavigate();
  const { user, isChef, isCaterer, isDecorator } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getServiceType = () => {
    if (isChef) return 'chef';
    if (isCaterer) return 'caterer';
    if (isDecorator) return 'decorator';
    return user?.role || 'chef';
  };

  const serviceType = getServiceType();
  const config = SERVICE_TYPE_CONFIG[serviceType] || SERVICE_TYPE_CONFIG.chef;

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError('');

    try {
      const response = await serviceAPI.create({
        ...formData,
        service_type: serviceType,
      });
      navigate(`/services/${response.data.service.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create service');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !['chef', 'caterer', 'decorator', 'admin'].includes(user.role)) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <Card className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Provider Account Required
          </h2>
          <p className="text-gray-600 mb-6">
            You need to register as a Chef, Caterer, or Decorator to create service listings.
          </p>
          <a
            href="/register?role=provider"
            className="btn-primary inline-block"
          >
            Register as Provider
          </a>
        </Card>
      </div>
    );
  }

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

      <ServiceForm onSubmit={handleSubmit} loading={loading} serviceType={serviceType} />
    </div>
  );
};

export default CreateService;
