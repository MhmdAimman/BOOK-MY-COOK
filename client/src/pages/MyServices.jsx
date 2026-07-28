import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { serviceAPI } from '../services/api';
import { API_URL } from '../utils/constants';
import { servicePlaceholder } from '../utils/placeholders';
import Button from '../components/common/Button';

const getImageUrl = (image) => {
  if (!image) return null;
  if (image.startsWith('http')) return image;
  const baseUrl = API_URL.replace('/api', '');
  return `${baseUrl}${image}`;
};

const MyServices = () => {
  const navigate = useNavigate();
  const { user, isProvider } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    if (!isProvider) {
      navigate('/dashboard');
      return;
    }
    loadServices();
  }, [isProvider]);

  const loadServices = async () => {
    try {
      const response = await serviceAPI.getMyServices();
      setServices(response.data.services || []);
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    setDeleting(serviceId);
    try {
      await serviceAPI.delete(serviceId);
      setServices(services.filter(s => s.id !== serviceId));
    } catch (error) {
      console.error('Failed to delete service:', error);
      alert('Failed to delete service');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Services</h1>
          <p className="text-gray-500 mt-1">Manage your service listings</p>
        </div>
        <Link to="/services/new">
          <Button variant="primary">Add New Service</Button>
        </Link>
      </div>

      {services.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No services yet</h3>
          <p className="text-gray-500 mb-6">Create your first service listing to start receiving bookings</p>
          <Link to="/services/new">
            <Button variant="primary">Create Service</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => {
            const imageUrl = service.images && service.images.length > 0
              ? getImageUrl(service.images[0])
              : servicePlaceholder;

            return (
              <div key={service.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <img
                    src={imageUrl}
                    alt={service.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = servicePlaceholder;
                    }}
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    {service.is_verified ? (
                      <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Verified
                      </span>
                    ) : (
                      <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Pending
                      </span>
                    )}
                    {service.is_active ? (
                      <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Active
                      </span>
                    ) : (
                      <span className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 text-lg mb-1">{service.title}</h3>
                  <p className="text-gray-500 text-sm mb-2 capitalize">{service.service_type}</p>
                  <p className="text-primary-600 font-bold text-lg mb-4">
                    ₹{service.price_per_event?.toLocaleString()}
                    <span className="text-gray-400 text-sm font-normal"> /event</span>
                  </p>

                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Link to={`/services/${service.id}/edit`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          Edit
                        </Button>
                      </Link>
                      <Link to={`/services/${service.id}/availability`} className="flex-1">
                        <Button variant="ghost" className="w-full">
                          Availability
                        </Button>
                      </Link>
                    </div>
                    <Button
                      variant="ghost"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 w-full"
                      onClick={() => handleDelete(service.id)}
                      loading={deleting === service.id}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyServices;
