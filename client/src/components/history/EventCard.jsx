import { StarIcon } from '@heroicons/react/24/solid';

const EventCard = ({ event }) => {
  const photos = event.photos || [];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {photos.length > 0 && (
        <div className="relative h-40">
          <img
            src={photos[0]}
            alt={event.event_type}
            className="w-full h-full object-cover"
          />
          {event.is_featured && (
            <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
              <StarIcon className="w-3 h-3" />
              Featured
            </span>
          )}
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="font-semibold text-gray-800">{event.event_type}</h4>
            <p className="text-sm text-gray-500">
              {new Date(event.event_date).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <span className="bg-primary-50 text-primary-700 text-sm px-2 py-1 rounded-full">
            {event.number_of_guests} guests
          </span>
        </div>

        {event.venue && (
          <p className="text-sm text-gray-600 flex items-center mt-2">
            <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {event.venue}
          </p>
        )}

        {event.cuisine_types && event.cuisine_types.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {event.cuisine_types.map((cuisine, idx) => (
              <span
                key={idx}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
              >
                {cuisine}
              </span>
            ))}
          </div>
        )}

        {event.customer_testimonial && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-600 italic">
              "{event.customer_testimonial}"
            </p>
            {event.customer_name && (
              <p className="text-xs text-gray-400 mt-1">
                — {event.customer_name}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;
