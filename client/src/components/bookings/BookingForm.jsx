import { useState } from 'react';
import TimeSlotPicker from './TimeSlotPicker';

const BookingForm = ({ service, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    event_date: '',
    event_time: '',
    event_type: '',
    number_of_guests: service?.min_guests || 50,
    event_address: '',
    city_id: '',
    area_id: '',
    special_requirements: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleTimeSelect = (time) => {
    setFormData((prev) => ({
      ...prev,
      event_time: time,
    }));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.event_date) {
      newErrors.event_date = 'Event date is required';
    } else {
      const selectedDate = new Date(formData.event_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.event_date = 'Cannot book for past dates';
      }
    }
    
    if (!formData.event_time) {
      newErrors.event_time = 'Event time is required';
    }
    
    if (!formData.event_type) {
      newErrors.event_type = 'Event type is required';
    }
    
    if (!formData.number_of_guests || formData.number_of_guests < (service?.min_guests || 10)) {
      newErrors.number_of_guests = `Minimum ${service?.min_guests || 10} guests required`;
    }
    
    if (formData.number_of_guests > (service?.max_guests || 500)) {
      newErrors.number_of_guests = `Maximum ${service?.max_guests || 500} guests allowed`;
    }
    
    if (!formData.event_address) {
      newErrors.event_address = 'Event address is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    onSubmit({
      ...formData,
      service_id: service.id,
      number_of_guests: parseInt(formData.number_of_guests),
    });
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Event Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="event_date"
              value={formData.event_date}
              onChange={handleChange}
              min={minDate}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none ${
                errors.event_date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.event_date && <p className="text-sm text-red-500 mt-1">{errors.event_date}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Type <span className="text-red-500">*</span>
            </label>
            <select
              name="event_type"
              value={formData.event_type}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none ${
                errors.event_type ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Event Type</option>
              <option value="Wedding">Wedding</option>
              <option value="Engagement">Engagement</option>
              <option value="Housewarming">Housewarming</option>
              <option value="Birthday">Birthday</option>
              <option value="Corporate Event">Corporate Event</option>
              <option value="Temple Festival">Temple Festival</option>
              <option value="Puberty Ceremony">Puberty Ceremony</option>
              <option value="Other">Other</option>
            </select>
            {errors.event_type && <p className="text-sm text-red-500 mt-1">{errors.event_type}</p>}
          </div>
        </div>

        <div className="mt-4">
          <TimeSlotPicker
            serviceId={service?.id}
            selectedDate={formData.event_date}
            selectedTime={formData.event_time}
            onTimeSelect={handleTimeSelect}
          />
          {errors.event_time && <p className="text-sm text-red-500 mt-1">{errors.event_time}</p>}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Guests <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="number_of_guests"
            value={formData.number_of_guests}
            onChange={handleChange}
            min={service?.min_guests || 10}
            max={service?.max_guests || 500}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none ${
              errors.number_of_guests ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.number_of_guests && <p className="text-sm text-red-500 mt-1">{errors.number_of_guests}</p>}
          <p className="text-xs text-gray-500 mt-1">
            Min: {service?.min_guests || 10} | Max: {service?.max_guests || 500}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Event Location</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Event Address <span className="text-red-500">*</span>
          </label>
          <textarea
            name="event_address"
            value={formData.event_address}
            onChange={handleChange}
            rows={3}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none ${
              errors.event_address ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter complete event venue address"
          />
          {errors.event_address && <p className="text-sm text-red-500 mt-1">{errors.event_address}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Special Requirements
          </label>
          <textarea
            name="special_requirements"
            value={formData.special_requirements}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            placeholder="Any special dietary requirements, preferences, or instructions..."
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Service</span>
            <span className="font-medium">{service?.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Provider</span>
            <span className="font-medium">{service?.provider?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Base Amount</span>
            <span className="font-medium">₹{service?.price_per_event?.toLocaleString()}</span>
          </div>
          <hr />
          <div className="flex justify-between text-lg">
            <span className="font-semibold">Total Amount</span>
            <span className="font-bold text-primary-600">₹{service?.price_per_event?.toLocaleString()}</span>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          * Final amount may vary based on additional requirements. Payment will be collected after provider confirms the booking.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating Booking...' : 'Submit Booking Request'}
      </button>
    </form>
  );
};

export default BookingForm;
