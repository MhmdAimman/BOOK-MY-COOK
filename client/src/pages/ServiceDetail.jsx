import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { serviceAPI, messageAPI, availabilityAPI } from '../services/api';
import { API_URL } from '../utils/constants';
import { serviceDetailPlaceholder } from '../utils/placeholders';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import DishList from '../components/dishes/DishList';
import RecentEvents from '../components/services/RecentEvents';
import ReviewList from '../components/reviews/ReviewList';
import AvailabilityCalendar from '../components/availability/AvailabilityCalendar';
import BackButton from '../components/common/BackButton';

const getImageUrl = (image) => {
  if (!image) return null;
  if (image.startsWith('http')) return image;
  const baseUrl = API_URL.replace('/api', '');
  return `${baseUrl}${image}`;
};

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [hasAvailability, setHasAvailability] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(true);

  useEffect(() => {
    loadService();
  }, [id]);

  useEffect(() => {
    if (service && !isOwner) {
      checkAvailability();
    }
  }, [service]);

  const loadService = async () => {
    try {
      const response = await serviceAPI.getById(id);
      setService(response.data.service);
    } catch (error) {
      console.error('Failed to load service:', error);
      navigate('/services');
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async () => {
    setCheckingAvailability(true);
    try {
      const today = new Date();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();
      const response = await availabilityAPI.getCalendar(id, month, year);
      const calendar = response.data.calendar || {};
      const hasSlots = Object.values(calendar).some(day => day.available > 0);
      setHasAvailability(hasSlots);
    } catch (error) {
      console.error('Failed to check availability:', error);
      setHasAvailability(false);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleSendMessage = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setShowMessageModal(true);
  };

  const handleStartConversation = async () => {
    if (!messageText.trim()) return;
    setSendingMessage(true);
    try {
      const response = await messageAPI.createConversation({
        service_id: service.id,
        provider_id: service.user_id,
        message: messageText.trim()
      });
      setShowMessageModal(false);
      setMessageText('');
      navigate(`/messages/${response.data.conversation.id}`);
    } catch (error) {
      console.error('Failed to start conversation:', error);
      alert('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-xl mb-6" />
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Service not found</h2>
        <Link to="/services" className="text-primary-500 hover:text-primary-600 mt-4 inline-block">
          Back to services
        </Link>
      </div>
    );
  }

  const images = service.images && service.images.length > 0 
    ? service.images.map(img => getImageUrl(img))
    : [serviceDetailPlaceholder];

  const isOwner = user && service.user_id === user.id;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <BackButton label="Back to listings" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="relative h-96">
              <img
                src={images[selectedImage]}
                alt={service.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = serviceDetailPlaceholder;
                }}
              />
              {service.is_verified && (
                <span className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  ✓ Verified
                </span>
              )}
            </div>

            {images.length > 1 && (
              <div className="p-4 flex gap-2 overflow-x-auto">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-primary-500' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                          e.target.src = serviceDetailPlaceholder;
                        }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 mt-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">{service.title}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              {service.rating > 0 && (
                <div className="flex items-center text-yellow-500">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                  <span className="ml-1 font-medium">{service.rating.toFixed(1)}</span>
                  <span className="ml-1 text-gray-400 text-sm">({service.total_reviews} reviews)</span>
                </div>
              )}
              {service.experience_years > 0 && (
                <span className="text-gray-500 text-sm">
                  {service.experience_years} years experience
                </span>
              )}
            </div>

            <p className="text-gray-600 mb-6">{service.description}</p>

            {service.cuisine_types && service.cuisine_types.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Cuisine Types</h3>
                <div className="flex flex-wrap gap-2">
                  {service.cuisine_types.map((cuisine, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                    >
                      {cuisine}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {service.event_types && service.event_types.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Event Types</h3>
                <div className="flex flex-wrap gap-2">
                  {service.event_types.map((eventType, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-secondary-50 text-secondary-700 rounded-full text-sm"
                    >
                      {eventType}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Food Type</p>
                <p className="font-medium text-gray-800">
                  {service.serves_veg && service.serves_non_veg
                    ? 'Both Veg & Non-Veg'
                    : service.serves_veg
                    ? 'Vegetarian Only'
                    : 'Non-Vegetarian Only'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Guest Capacity</p>
                <p className="font-medium text-gray-800">
                  {service.min_guests} - {service.max_guests} guests
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Availability Calendar</h2>
              {isOwner && (
                <Link to={`/services/${service.id}/availability`} className="text-primary-500 hover:text-primary-600 text-sm font-medium">
                  Manage Availability
                </Link>
              )}
            </div>
            <AvailabilityCalendar serviceId={service.id} mode="view" />
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 mt-6">
            <DishList serviceId={service.id} />
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 mt-6">
            <RecentEvents serviceId={service.id} />
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 mt-6">
            <ReviewList serviceId={service.id} />
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <div className="text-center mb-6">
              <p className="text-3xl font-bold text-primary-600">
                ₹{service.price_per_event?.toLocaleString()}
              </p>
              <p className="text-gray-500 text-sm">per event</p>
            </div>

            {service.provider && (
              <div className="border-t pt-6 mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">About the Chef</h3>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-medium text-lg">
                      {service.provider.name?.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-800">{service.provider.name}</p>
                    <p className="text-sm text-gray-500">{service.city || 'Tamil Nadu'}</p>
                  </div>
                </div>
              </div>
            )}

            {isOwner ? (
              <div className="space-y-3">
                <Link to={`/services/${service.id}/edit`}>
                  <Button variant="outline" className="w-full">
                    Edit Listing
                  </Button>
                </Link>
                <Link to={`/services/${service.id}/availability`}>
                  <Button variant="outline" className="w-full">
                    Manage Availability
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full text-red-500 hover:text-red-600"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this listing?')) {
                      serviceAPI.delete(service.id).then(() => navigate('/services'));
                    }
                  }}
                >
                  Delete Listing
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {checkingAvailability ? (
                  <Button variant="primary" className="w-full" disabled>
                    Checking availability...
                  </Button>
                ) : hasAvailability ? (
                  <Link to={`/services/${service.id}/book`}>
                    <Button variant="primary" className="w-full">
                      Book Now
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Button variant="primary" className="w-full" disabled>
                      No Slots Available
                    </Button>
                    <p className="text-xs text-gray-500 text-center">
                      Provider has not set availability yet
                    </p>
                  </>
                )}
                <Button variant="outline" className="w-full" onClick={handleSendMessage}>
                  Send Message
                </Button>
              </div>
            )}

            {service.provider?.phone && (
              <div className="mt-6 pt-6 border-t text-center">
                <p className="text-sm text-gray-500 mb-2">Contact directly</p>
                <a
                  href={`tel:${service.provider.phone}`}
                  className="text-primary-500 font-medium hover:text-primary-600"
                >
                  {service.provider.phone}
                </a>
              </div>
            )}
          </Card>
        </div>
      </div>

      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Send Message</h3>
              <button
                onClick={() => setShowMessageModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Send a message to {service.provider?.name || 'the provider'} about "{service.title}"
            </p>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message here..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
            />
            <div className="flex gap-3 mt-4">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setShowMessageModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleStartConversation}
                loading={sendingMessage}
                disabled={!messageText.trim()}
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetail;
