import { useState, useEffect, useRef } from 'react';
import { locationAPI } from '../../services/api';
import { CUISINE_TYPES, EVENT_TYPES } from '../../utils/constants';

const SearchFilters = ({ filters, onFilterChange, serviceType = 'chef' }) => {
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      locationAPI.getCities().then(({ data }) => setCities(data.cities)).catch(err => console.error('Failed to load cities:', err));
    }
  }, []);

  useEffect(() => {
    if (filters.city) {
      locationAPI.getAreas(filters.city).then(({ data }) => setAreas(data.areas)).catch(err => console.error('Failed to load areas:', err));
    }
  }, [filters.city]);

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      city: '',
      area: '',
      cuisine: '',
      eventType: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      veg: '',
      guests: '',
      verified: '',
      availableDate: '',
      sort: 'rating',
      order: 'desc',
    });
    setAreas([]);
  };

  const hasActiveFilters = filters.city || filters.area || filters.cuisine || filters.eventType || 
    filters.minPrice || filters.maxPrice || filters.minRating || filters.veg || 
    filters.guests || filters.verified || filters.availableDate;

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Filters</h3>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-600">
              Clear all
            </button>
          )}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
          >
            {showAdvanced ? 'Less' : 'More filters'}
            <svg className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <select
            value={filters.city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Cities</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>{city.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
          <select
            value={filters.area || ''}
            onChange={(e) => handleChange('area', e.target.value)}
            disabled={!filters.city}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
          >
            <option value="">All Areas</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>{area.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
          <select
            value={filters.sort || 'rating'}
            onChange={(e) => handleChange('sort', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="rating">Rating</option>
            <option value="price">Price</option>
            <option value="reviews">Reviews</option>
            <option value="newest">Newest</option>
            <option value="experience">Experience</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
          <select
            value={filters.order || 'desc'}
            onChange={(e) => handleChange('order', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="desc">High to Low</option>
            <option value="asc">Low to High</option>
          </select>
        </div>
      </div>

      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {serviceType === 'chef' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine</label>
                <select
                  value={filters.cuisine || ''}
                  onChange={(e) => handleChange('cuisine', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Cuisines</option>
                  {CUISINE_TYPES.map((cuisine) => (
                    <option key={cuisine} value={cuisine}>{cuisine}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
              <input
                type="number"
                value={filters.minPrice || ''}
                onChange={(e) => handleChange('minPrice', e.target.value)}
                placeholder="₹ Min"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
              <input
                type="number"
                value={filters.maxPrice || ''}
                onChange={(e) => handleChange('maxPrice', e.target.value)}
                placeholder="₹ Max"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Rating</label>
              <select
                value={filters.minRating || ''}
                onChange={(e) => handleChange('minRating', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Guest Count</label>
              <input
                type="number"
                value={filters.guests || ''}
                onChange={(e) => handleChange('guests', e.target.value)}
                placeholder="Number of guests"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Available On</label>
              <input
                type="date"
                value={filters.availableDate || ''}
                onChange={(e) => handleChange('availableDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Verification</label>
              <select
                value={filters.verified || ''}
                onChange={(e) => handleChange('verified', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Services</option>
                <option value="true">Verified Only</option>
              </select>
            </div>

            {serviceType !== 'decorator' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Food Type</label>
                <select
                  value={filters.veg || ''}
                  onChange={(e) => handleChange('veg', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All</option>
                  <option value="true">Vegetarian</option>
                  <option value="false">Non-Vegetarian</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
