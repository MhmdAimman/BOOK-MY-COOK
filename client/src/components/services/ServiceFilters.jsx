import { useState, useEffect, useRef } from 'react';
import { locationAPI } from '../../services/api';
import { CUISINE_TYPES, EVENT_TYPES } from '../../utils/constants';

const SERVICE_TYPE_LABELS = {
  chef: {
    cuisineLabel: 'Cuisine Type',
    typeLabel: 'Food Type',
  },
  caterer: {
    cuisineLabel: 'Cuisine Styles',
    typeLabel: 'Catering Style',
  },
  decorator: {
    cuisineLabel: 'Decoration Styles',
    typeLabel: 'Event Types',
  },
};

const ServiceFilters = ({ filters, onFilterChange, serviceType = 'chef' }) => {
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      locationAPI.getCities().then(({ data }) => setCities(data.cities)).catch(err => console.error('Failed to load cities:', err));
    }
  }, []);

  const loadAreas = async (cityId) => {
    if (!cityId) {
      setAreas([]);
      return;
    }
    try {
      const response = await locationAPI.getAreas(cityId);
      setAreas(response.data.areas);
    } catch (error) {
      console.error('Failed to load areas:', error);
    }
  };

  const handleCityChange = (e) => {
    const cityId = e.target.value;
    onFilterChange({ ...filters, city: cityId, area: '' });
    loadAreas(cityId);
  };

  const handleAreaChange = (e) => {
    onFilterChange({ ...filters, area: e.target.value });
  };

  const handleCuisineChange = (cuisine) => {
    const currentCuisines = filters.cuisine || [];
    const newCuisines = currentCuisines.includes(cuisine)
      ? currentCuisines.filter((c) => c !== cuisine)
      : [...currentCuisines, cuisine];
    onFilterChange({ ...filters, cuisine: newCuisines });
  };

  const handleEventTypeChange = (eventType) => {
    const currentEvents = filters.eventType || [];
    const newEvents = currentEvents.includes(eventType)
      ? currentEvents.filter((e) => e !== eventType)
      : [...currentEvents, eventType];
    onFilterChange({ ...filters, eventType: newEvents });
  };

  const clearFilters = () => {
    onFilterChange({
      city: '',
      area: '',
      cuisine: [],
      eventType: [],
      search: '',
    });
    setAreas([]);
  };

  const hasActiveFilters = filters.city || filters.area || (filters.cuisine && filters.cuisine.length > 0) || (filters.eventType && filters.eventType.length > 0);

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Filters</h3>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-500 hover:text-red-600"
            >
              Clear all
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden text-gray-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <select
              value={filters.city || ''}
              onChange={handleCityChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
            <select
              value={filters.area || ''}
              onChange={handleAreaChange}
              disabled={!filters.city}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none disabled:bg-gray-100"
            >
              <option value="">All Areas</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {SERVICE_TYPE_LABELS[serviceType].cuisineLabel}
            </label>
            <div className="flex flex-wrap gap-2">
              {CUISINE_TYPES.slice(0, 6).map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => handleCuisineChange(cuisine)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    (filters.cuisine || []).includes(cuisine)
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>
        </div>

        {serviceType !== 'decorator' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
            <div className="flex flex-wrap gap-2">
              {EVENT_TYPES.map((eventType) => (
                <button
                  key={eventType}
                  onClick={() => handleEventTypeChange(eventType)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    (filters.eventType || []).includes(eventType)
                      ? 'bg-secondary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {eventType}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceFilters;
