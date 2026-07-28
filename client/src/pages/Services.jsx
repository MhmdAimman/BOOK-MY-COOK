import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import ServiceList from '../components/services/ServiceList';
import SearchBar from '../components/search/SearchBar';
import SearchFilters from '../components/search/SearchFilters';
import { serviceAPI, locationAPI } from '../services/api';

const SERVICE_TYPE_CONFIG = {
  chef: {
    title: 'Find Professional Chefs',
    subtitle: 'Browse verified chefs across Tamil Nadu for your events',
    countLabel: 'chefs',
  },
  caterer: {
    title: 'Find Premium Caterers',
    subtitle: 'Professional catering services for weddings and events',
    countLabel: 'caterers',
  },
  decorator: {
    title: 'Find Expert Decorators',
    subtitle: 'Transform your events with stunning decorations',
    countLabel: 'decorators',
  },
};

const Services = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cityId, setCityId] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    current_page: 1,
    has_next: false,
    has_prev: false,
  });

  const getServiceType = () => {
    const path = location.pathname;
    if (path.includes('/caterers')) return 'caterer';
    if (path.includes('/decorators')) return 'decorator';
    return 'chef';
  };

  const serviceType = getServiceType();
  const config = SERVICE_TYPE_CONFIG[serviceType];

  const [filters, setFilters] = useState({
    type: serviceType,
    city: '',
    area: searchParams.get('area') || '',
    cuisine: searchParams.get('cuisine') || '',
    eventType: searchParams.get('event_type') || '',
    minPrice: searchParams.get('min_price') || '',
    maxPrice: searchParams.get('max_price') || '',
    minRating: searchParams.get('min_rating') || '',
    veg: searchParams.get('veg') || '',
    guests: searchParams.get('guests') || '',
    verified: searchParams.get('verified') || '',
    availableDate: searchParams.get('available_date') || '',
    sort: searchParams.get('sort') || 'rating',
    order: searchParams.get('order') || 'desc',
    search: searchParams.get('q') || '',
  });

  useEffect(() => {
    setFilters(prev => ({ ...prev, type: serviceType }));
  }, [serviceType]);

  useEffect(() => {
    const cityParam = searchParams.get('city');
    if (cityParam) {
      if (cityParam.match(/^\d+$/)) {
        setCityId(parseInt(cityParam));
        setFilters(prev => ({ ...prev, city: cityParam }));
      } else {
        locationAPI.getCities().then(({ data }) => {
          const city = data.cities.find(c => c.name.toLowerCase() === cityParam.toLowerCase());
          if (city) {
            setCityId(city.id);
            setFilters(prev => ({ ...prev, city: city.id.toString() }));
          }
        }).catch(err => console.error('Failed to lookup city:', err));
      }
    }
  }, [searchParams.get('city')]);

  const debounceTimer = useRef(null);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      loadServices();
    }, 300);
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [filters, searchParams.get('page')]);

  const loadServices = async () => {
    setLoading(true);
    try {
      const params = {
        type: filters.type,
        page: searchParams.get('page') || 1,
        per_page: 12,
      };

      if (filters.city) params.city = filters.city;
      if (filters.area) params.area = filters.area;
      if (filters.cuisine) params.cuisine = filters.cuisine;
      if (filters.eventType) params.event_type = filters.eventType;
      if (filters.minPrice) params.min_price = filters.minPrice;
      if (filters.maxPrice) params.max_price = filters.maxPrice;
      if (filters.minRating) params.min_rating = filters.minRating;
      if (filters.veg) params.veg = filters.veg;
      if (filters.guests) params.guests = filters.guests;
      if (filters.verified) params.verified = filters.verified;
      if (filters.availableDate) params.available_date = filters.availableDate;
      if (filters.sort) params.sort = filters.sort;
      if (filters.order) params.order = filters.order;
      if (filters.search) params.q = filters.search;

      const response = await serviceAPI.getAll(params);
      setServices(response.data.services);
      setPagination({
        total: response.data.total,
        pages: response.data.pages,
        current_page: response.data.current_page,
        has_next: response.data.has_next,
        has_prev: response.data.has_prev,
      });
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setSearchParams({ page: 1 });
  };

  const handleSearch = (query) => {
    setFilters(prev => ({ ...prev, search: query }));
    setSearchParams({ page: 1, q: query });
  };

  const handlePageChange = (page) => {
    setSearchParams({ ...Object.fromEntries(searchParams), page });
    window.scrollTo(0, 0);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{config.title}</h1>
        <p className="text-gray-600 mt-2">{config.subtitle}</p>
      </div>

      <div className="mb-6">
        <SearchBar onSearch={handleSearch} defaultValue={filters.search} />
      </div>

      <SearchFilters filters={filters} onFilterChange={handleFilterChange} serviceType={serviceType} />

      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600">
            {loading ? 'Loading...' : `${pagination.total} ${config.countLabel} found`}
          </p>
        </div>

        <ServiceList services={services} loading={loading} />

        {pagination.pages > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            <button
              onClick={() => handlePageChange(pagination.current_page - 1)}
              disabled={!pagination.has_prev}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <div className="flex items-center gap-2">
              {[...Array(pagination.pages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  className={`w-10 h-10 rounded-lg ${
                    pagination.current_page === index + 1
                      ? 'bg-primary-500 text-white'
                      : 'border hover:bg-gray-50'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => handlePageChange(pagination.current_page + 1)}
              disabled={!pagination.has_next}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
