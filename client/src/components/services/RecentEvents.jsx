import { useState, useEffect } from 'react';
import { StarIcon, CalendarIcon, UserIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { serviceAPI } from '../../services/api';

const RecentEvents = ({ serviceId }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [serviceId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data } = await serviceAPI.getRecentEvents(serviceId);
      setEvents(data.events);
    } catch (error) {
      console.error('Error fetching recent events:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (events.length === 0) {
    return null;
  }

  const renderStars = (rating) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          star <= rating 
            ? <StarIconSolid key={star} className="w-4 h-4 text-yellow-400" />
            : <StarIcon key={star} className="w-4 h-4 text-gray-300" />
        ))}
      </div>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Recent Events</h3>
      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-gray-50 rounded-lg p-4 border border-gray-100"
          >
            <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
              <div>
                <h4 className="font-medium text-gray-800">
                  {event.event_type || 'Event'}
                </h4>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{formatDate(event.event_date)}</span>
                </div>
              </div>
              {event.number_of_guests && (
                <span className="bg-primary-50 text-primary-700 text-sm px-2 py-1 rounded-full">
                  {event.number_of_guests} guests
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <UserIcon className="w-4 h-4 text-gray-400" />
                <span>{event.customer_name}</span>
              </div>
              {event.venue && (
                <div className="flex items-center gap-1">
                  <MapPinIcon className="w-4 h-4 text-gray-400" />
                  <span>{event.venue}{event.city ? `, ${event.city}` : ''}</span>
                </div>
              )}
            </div>

            {event.rating && (
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(event.rating)}
                  <span className="text-sm font-medium text-gray-700">
                    {event.rating}/5
                  </span>
                </div>
                {event.review_comment && (
                  <p className="text-sm text-gray-600 italic">
                    "{event.review_comment}"
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentEvents;
