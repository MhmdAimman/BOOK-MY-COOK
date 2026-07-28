import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BookingCalendar from '../components/bookings/BookingCalendar';
import { serviceAPI, bookingAPI } from '../services/api';
import { API_URL } from '../utils/constants';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const getImageUrl = (image) => {
  if (!image) return null;
  if (image.startsWith('http')) return image;
  const baseUrl = API_URL.replace('/api', '');
  return `${baseUrl}${image}`;
};

const CreateBooking = () => {
  const { id: serviceId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    event_type: '',
    number_of_guests: 50,
    event_address: '',
    city_id: '',
    area_id: '',
    special_requirements: '',
  });

  useEffect(() => {
    loadService();
  }, [serviceId]);

  const loadService = async () => {
    try {
      const response = await serviceAPI.getById(serviceId);
      setService(response.data.service);
    } catch (error) {
      console.error('Failed to load service:', error);
      navigate('/services');
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = (slotData) => {
    setSelectedSlot(slotData);
    setStep(2);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setError('Please select a date and time slot');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const bookingData = {
        service_id: parseInt(serviceId),
        availability_id: selectedSlot.slot.id,
        event_date: selectedSlot.date,
        event_time: selectedSlot.slot.start_time,
        event_type: formData.event_type,
        number_of_guests: parseInt(formData.number_of_guests),
        event_address: formData.event_address,
        city_id: formData.city_id ? parseInt(formData.city_id) : null,
        area_id: formData.area_id ? parseInt(formData.area_id) : null,
        special_requirements: formData.special_requirements,
      };

      const response = await bookingAPI.create(bookingData);
      navigate(`/bookings/${response.data.booking.id}`, {
        state: { message: 'Booking requested successfully! Waiting for provider confirmation.' }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <Card className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Login Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please login to book this service.
          </p>
          <Link
            to="/login"
            className="btn-primary inline-block"
          >
            Login
          </Link>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="h-96 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 text-center">
        <h2 className="text-xl font-semibold text-gray-800">Service not found</h2>
        <Link to="/services" className="text-primary-500 hover:text-primary-600 mt-4 inline-block">
          Browse services
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link to={`/services/${serviceId}`} className="text-gray-500 hover:text-gray-700 flex items-center mb-4">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to service
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-800">Request Booking</h1>
        <p className="text-gray-600 mt-2">
          Select your preferred date and time, then fill in the details
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary-500 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="font-medium text-gray-800">Select Date & Time</span>
              {step >= 2 && (
                <svg className="w-5 h-5 text-green-500 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <BookingCalendar
              serviceId={serviceId}
              onSlotSelect={handleSlotSelect}
              selectedSlot={selectedSlot}
            />
          </div>

          {selectedSlot && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary-500 text-white">
                  2
                </div>
                <span className="font-medium text-gray-800">Booking Details</span>
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <div className="bg-primary-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">Selected Slot</p>
                <p className="font-semibold text-gray-800">
                  {new Date(selectedSlot.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p className="text-primary-600">
                  {selectedSlot.slot?.start_time} - {selectedSlot.slot?.end_time}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Type *
                  </label>
                  <select
                    name="event_type"
                    value={formData.event_type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select event type</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Corporate">Corporate Event</option>
                    <option value="Housewarming">Housewarming</option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="Religious">Religious Ceremony</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Guests *
                  </label>
                  <input
                    type="number"
                    name="number_of_guests"
                    value={formData.number_of_guests}
                    onChange={handleInputChange}
                    min={service.min_guests}
                    max={service.max_guests}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Min: {service.min_guests}, Max: {service.max_guests}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Address *
                  </label>
                  <textarea
                    name="event_address"
                    value={formData.event_address}
                    onChange={handleInputChange}
                    required
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                    placeholder="Full address where the event will be held"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Requirements
                  </label>
                  <textarea
                    name="special_requirements"
                    value={formData.special_requirements}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                    placeholder="Any special requirements or dietary restrictions"
                  />
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    loading={submitting}
                  >
                    Request Booking
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <div className="text-center mb-6">
              <div className="w-24 h-24 mx-auto bg-gray-100 rounded-lg overflow-hidden mb-4">
                {service.images && service.images.length > 0 ? (
                  <img
                    src={getImageUrl(service.images[0])}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <h2 className="text-lg font-semibold text-gray-800">{service.title}</h2>
              <p className="text-sm text-gray-500">{service.city}</p>
              <p className="text-primary-600 font-bold text-xl mt-2">
                ₹{service.price_per_event?.toLocaleString()}
                <span className="text-gray-400 text-sm font-normal"> /event</span>
              </p>
            </div>

            {service.provider && (
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-800 mb-3 text-sm">Provider</h3>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-medium">
                      {service.provider.name?.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-800 text-sm">{service.provider.name}</p>
                    <p className="text-xs text-gray-500">{service.provider.role}</p>
                  </div>
                </div>
              </div>
            )}

            {selectedSlot && (
              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold text-gray-800 mb-2 text-sm">Booking Summary</h3>
                <div className="bg-primary-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">Date</p>
                  <p className="font-medium text-sm text-gray-800">
                    {new Date(selectedSlot.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <p className="text-xs text-gray-600 mt-2">Time</p>
                  <p className="font-medium text-sm text-primary-600">
                    {selectedSlot.slot?.start_time} - {selectedSlot.slot?.end_time}
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateBooking;
