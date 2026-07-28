import { useState } from 'react';
import { historyAPI } from '../../services/api';
import Button from '../common/Button';
import Input from '../common/Input';

const EventForm = ({ serviceId, onSuccess, onCancel, editEvent = null }) => {
  const [formData, setFormData] = useState({
    event_date: editEvent?.event_date?.split('T')[0] || '',
    event_type: editEvent?.event_type || '',
    number_of_guests: editEvent?.number_of_guests || '',
    venue: editEvent?.venue || '',
    customer_name: editEvent?.customer_name || '',
    customer_testimonial: editEvent?.customer_testimonial || '',
    cuisine_types: editEvent?.cuisine_types?.join(', ') || '',
    photos: editEvent?.photos?.join(', ') || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.event_date || !formData.event_type) {
      setError('Event date and type are required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const payload = {
        event_date: formData.event_date,
        event_type: formData.event_type,
        number_of_guests: formData.number_of_guests ? parseInt(formData.number_of_guests) : null,
        venue: formData.venue || null,
        customer_name: formData.customer_name || null,
        customer_testimonial: formData.customer_testimonial || null,
        cuisine_types: formData.cuisine_types
          ? formData.cuisine_types.split(',').map((c) => c.trim())
          : [],
        photos: formData.photos
          ? formData.photos.split(',').map((p) => p.trim())
          : [],
      };

      if (editEvent) {
        await historyAPI.update(editEvent.id, payload);
      } else {
        await historyAPI.add(serviceId, payload);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-4 border border-gray-200">
      <h4 className="font-semibold text-gray-800 mb-4">
        {editEvent ? 'Edit Event' : 'Add Event to History'}
      </h4>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Event Date"
            name="event_date"
            type="date"
            value={formData.event_date}
            onChange={handleChange}
            required
          />
          <Input
            label="Event Type"
            name="event_type"
            value={formData.event_type}
            onChange={handleChange}
            placeholder="e.g., Wedding, Birthday"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Number of Guests"
            name="number_of_guests"
            type="number"
            value={formData.number_of_guests}
            onChange={handleChange}
            placeholder="e.g., 150"
          />
          <Input
            label="Venue"
            name="venue"
            value={formData.venue}
            onChange={handleChange}
            placeholder="e.g., Chennai Trade Centre"
          />
        </div>

        <Input
          label="Customer Name"
          name="customer_name"
          value={formData.customer_name}
          onChange={handleChange}
          placeholder="e.g., Suresh & Priya"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer Testimonial
          </label>
          <textarea
            name="customer_testimonial"
            value={formData.customer_testimonial}
            onChange={handleChange}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Customer's feedback about the event..."
          />
        </div>

        <Input
          label="Cuisine Types (comma-separated)"
          name="cuisine_types"
          value={formData.cuisine_types}
          onChange={handleChange}
          placeholder="e.g., Chettinad, Brahmin"
        />

        <Input
          label="Photo URLs (comma-separated)"
          name="photos"
          value={formData.photos}
          onChange={handleChange}
          placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg"
        />
      </div>

      <div className="flex gap-2 mt-4">
        <Button type="submit" loading={loading}>
          {editEvent ? 'Update Event' : 'Add Event'}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default EventForm;
