import { useState, useEffect } from 'react';
import { historyAPI } from '../../services/api';
import EventCard from './EventCard';

const EventList = ({ serviceId, featuredOnly = false }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [serviceId, featuredOnly]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data } = await historyAPI.getByService(serviceId, {
        featured: featuredOnly,
      });
      setEvents(data.events);
    } catch (error) {
      console.error('Error fetching events:', error);
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

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-800">
        {featuredOnly ? 'Featured Events' : 'Event History'}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.slice(0, featuredOnly ? 5 : undefined).map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};

export default EventList;
