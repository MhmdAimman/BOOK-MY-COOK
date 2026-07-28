import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { serviceAPI } from '../services/api';
import AvailabilityCalendar from '../components/availability/AvailabilityCalendar';
import AvailabilityManager from '../components/availability/AvailabilityManager';
import Button from '../components/common/Button';

const AvailabilityPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isProvider } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('calendar');

  useEffect(() => {
    loadService();
  }, [id]);

  const loadService = async () => {
    try {
      const response = await serviceAPI.getById(id);
      setService(response.data.service);
      
      if (user?.id !== response.data.service.user_id) {
        navigate('/my-services');
      }
    } catch (error) {
      console.error('Failed to load service:', error);
      navigate('/my-services');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
          <div className="h-96 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 text-center">
        <h2 className="text-xl font-semibold text-gray-800">Service not found</h2>
        <Link to="/my-services" className="text-primary-500 hover:text-primary-600 mt-4 inline-block">
          Back to My Services
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link to="/my-services" className="text-gray-500 hover:text-gray-700 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to My Services
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Manage Availability</h1>
        <p className="text-gray-500 mt-1">{service.title}</p>
      </div>

      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'calendar' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('calendar')}
        >
          Calendar View
        </Button>
        <Button
          variant={activeTab === 'manage' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('manage')}
        >
          Add Availability
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {activeTab === 'calendar' ? (
            <AvailabilityCalendar serviceId={service.id} mode="manage" />
          ) : (
            <AvailabilityManager serviceId={service.id} />
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 sticky top-24">
            <h3 className="font-semibold text-gray-800 mb-4">Tips</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Set your available dates and time slots for bookings</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Green dates have available slots</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Yellow dates are fully booked</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Booked slots cannot be deleted</span>
              </li>
            </ul>

            <div className="mt-6 pt-6 border-t">
              <Link to={`/services/${service.id}`}>
                <Button variant="outline" className="w-full">
                  View Public Page
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityPage;
