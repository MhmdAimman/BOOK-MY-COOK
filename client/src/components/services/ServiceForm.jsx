import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { locationAPI } from '../../services/api';
import { CUISINE_TYPES, EVENT_TYPES } from '../../utils/constants';
import Input from '../common/Input';
import Button from '../common/Button';
import FileUpload from '../common/FileUpload';
import BackButton from '../common/BackButton';

const ServiceForm = ({ initialData, onSubmit, loading, serviceType = 'chef' }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [formData, setFormData] = useState(() => ({
    title: '',
    description: '',
    service_type: serviceType,
    cuisine_types: [],
    event_types: [],
    experience_years: 0,
    price_per_event: '',
    price_unit: 'per_event',
    serves_veg: true,
    serves_non_veg: false,
    min_guests: 10,
    max_guests: 500,
    city_id: '',
    area_id: '',
    images: [],
    ...initialData,
  }));
  const [errors, setErrors] = useState({});
  const mounted = useRef(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      locationAPI.getCities().then(({ data }) => setCities(data.cities)).catch(err => console.error('Failed to load cities:', err));
    }
  }, []);

  useEffect(() => {
    if (serviceType) {
      setFormData(prev => ({ ...prev, service_type: serviceType }));
    }
  }, [serviceType]);

  useEffect(() => {
    if (initialData && !initialized.current) {
      initialized.current = true;
      const newData = {
        cuisine_types: initialData.cuisine_types || [],
        event_types: initialData.event_types || [],
        images: initialData.images || [],
      };
      setFormData(prev => ({ ...prev, ...initialData, ...newData }));
    }
  }, [initialData]);

  useEffect(() => {
    if (initialData?.city_id && initialized.current) {
      locationAPI.getAreas(initialData.city_id).then(({ data }) => setAreas(data.areas)).catch(err => console.error('Failed to load areas:', err));
    }
  }, [initialData?.city_id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCityChange = (e) => {
    const cityId = e.target.value;
    setFormData((prev) => ({ ...prev, city_id: cityId, area_id: '' }));
    if (cityId) {
      locationAPI.getAreas(cityId).then(({ data }) => setAreas(data.areas)).catch(err => console.error('Failed to load areas:', err));
    } else {
      setAreas([]);
    }
  };

  const handleCuisineToggle = (cuisine) => {
    setFormData((prev) => ({
      ...prev,
      cuisine_types: prev.cuisine_types.includes(cuisine)
        ? prev.cuisine_types.filter((c) => c !== cuisine)
        : [...prev.cuisine_types, cuisine],
    }));
  };

  const handleEventToggle = (eventType) => {
    setFormData((prev) => ({
      ...prev,
      event_types: prev.event_types.includes(eventType)
        ? prev.event_types.filter((e) => e !== eventType)
        : [...prev.event_types, eventType],
    }));
  };

  const handleImagesChange = (images) => {
    setFormData((prev) => ({ ...prev, images }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.price_per_event || formData.price_per_event <= 0) {
      newErrors.price_per_event = 'Valid price is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        
        <Input
          label="Service Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          placeholder="e.g., Professional Chettinad Chef for Events"
          required
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            placeholder="Describe your services, experience, and what makes you unique..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Years of Experience
            </label>
            <input
              type="number"
              name="experience_years"
              value={formData.experience_years}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          <Input
            label="Price per Event (₹)"
            name="price_per_event"
            type="number"
            value={formData.price_per_event}
            onChange={handleChange}
            error={errors.price_per_event}
            placeholder="e.g., 5000"
            required
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Cuisine Types</h2>
        <p className="text-gray-500 text-sm mb-3">Select all cuisines you specialize in</p>
        <div className="flex flex-wrap gap-2">
          {CUISINE_TYPES.map((cuisine) => (
            <button
              key={cuisine}
              type="button"
              onClick={() => handleCuisineToggle(cuisine)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                formData.cuisine_types.includes(cuisine)
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cuisine}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Event Types</h2>
        <p className="text-gray-500 text-sm mb-3">Select events you cater to</p>
        <div className="flex flex-wrap gap-2">
          {EVENT_TYPES.map((eventType) => (
            <button
              key={eventType}
              type="button"
              onClick={() => handleEventToggle(eventType)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                formData.event_types.includes(eventType)
                  ? 'bg-secondary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {eventType}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Food Preferences</h2>
        <div className="flex gap-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="serves_veg"
              checked={formData.serves_veg}
              onChange={handleChange}
              className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="ml-2 text-gray-700">Vegetarian</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="serves_non_veg"
              checked={formData.serves_non_veg}
              onChange={handleChange}
              className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="ml-2 text-gray-700">Non-Vegetarian</span>
          </label>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Guest Capacity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Guests
            </label>
            <input
              type="number"
              name="min_guests"
              value={formData.min_guests}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Guests
            </label>
            <input
              type="number"
              name="max_guests"
              value={formData.max_guests}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Location</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <select
              name="city_id"
              value={formData.city_id}
              onChange={handleCityChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              <option value="">Select City</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Area
            </label>
            <select
              name="area_id"
              value={formData.area_id}
              onChange={handleChange}
              disabled={!formData.city_id}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none disabled:bg-gray-100"
            >
              <option value="">Select Area</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Images</h2>
        <p className="text-gray-500 text-sm mb-3">Upload up to 5 images of your work</p>
        <FileUpload
          images={formData.images}
          onImagesChange={handleImagesChange}
          maxImages={5}
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {initialData ? 'Update Service' : 'Create Service'}
        </Button>
      </div>
    </form>
  );
};

export default ServiceForm;
