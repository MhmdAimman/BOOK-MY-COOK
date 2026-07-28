import { Link } from 'react-router-dom';
import { API_URL } from '../../utils/constants';
import { servicePlaceholder } from '../../utils/placeholders';

const getImageUrl = (image) => {
  if (!image) return null;
  if (image.startsWith('http')) return image;
  const baseUrl = API_URL.replace('/api', '');
  return `${baseUrl}${image}`;
};

const ServiceCard = ({ service }) => {
  const image = service.images && service.images.length > 0 
    ? getImageUrl(service.images[0]) 
    : servicePlaceholder;

  return (
    <Link to={`/services/${service.id}`} className="block">
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
        <div className="relative h-48">
          <img
            src={image}
            alt={service.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = servicePlaceholder;
            }}
          />
          {service.is_verified && (
            <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              Verified
            </span>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
              {service.title}
            </h3>
            {service.rating > 0 && (
              <div className="flex items-center text-yellow-500">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
                <span className="ml-1 text-sm text-gray-600">{service.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {service.description || 'Professional chef services for your events'}
          </p>
          
          {service.cuisine_types && service.cuisine_types.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {service.cuisine_types.slice(0, 3).map((cuisine, index) => (
                <span
                  key={index}
                  className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full"
                >
                  {cuisine}
                </span>
              ))}
              {service.cuisine_types.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{service.cuisine_types.length - 3} more
                </span>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {service.city || 'Tamil Nadu'}
            </span>
            {service.price_per_event && (
              <span className="font-semibold text-primary-600">
                ₹{service.price_per_event.toLocaleString()}
                <span className="text-xs text-gray-400 ml-1">per event</span>
              </span>
            )}
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-medium text-sm">
                {service.provider?.name?.charAt(0) || 'C'}
              </span>
            </div>
            <span className="ml-2 text-sm text-gray-600">
              {service.provider?.name || 'Chef'}
            </span>
            {service.experience_years > 0 && (
              <span className="ml-auto text-xs text-gray-400">
                {service.experience_years} yrs exp
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ServiceCard;
