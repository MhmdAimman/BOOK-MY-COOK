import { useState } from 'react';
import { dishAPI } from '../../services/api';
import Button from '../common/Button';
import Input from '../common/Input';

const DishForm = ({ serviceId, onSuccess, onCancel, editDish = null }) => {
  const [formData, setFormData] = useState({
    name: editDish?.name || '',
    description: editDish?.description || '',
    image_url: editDish?.image_url || '',
    cuisine_type: editDish?.cuisine_type || '',
    is_veg: editDish?.is_veg ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Dish name is required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (editDish) {
        await dishAPI.update(editDish.id, formData);
      } else {
        await dishAPI.add(serviceId, formData);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save dish');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-4 border border-gray-200">
      <h4 className="font-semibold text-gray-800 mb-4">
        {editDish ? 'Edit Dish' : 'Add Signature Dish'}
      </h4>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <Input
          label="Dish Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Chettinad Chicken Curry"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Brief description of the dish"
          />
        </div>

        <Input
          label="Image URL"
          name="image_url"
          value={formData.image_url}
          onChange={handleChange}
          placeholder="https://example.com/dish-image.jpg"
        />

        <Input
          label="Cuisine Type"
          name="cuisine_type"
          value={formData.cuisine_type}
          onChange={handleChange}
          placeholder="e.g., Chettinad, Brahmin"
        />

        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_veg"
            id="is_veg"
            checked={formData.is_veg}
            onChange={handleChange}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="is_veg" className="ml-2 text-sm text-gray-700">
            Vegetarian
          </label>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Button type="submit" loading={loading}>
          {editDish ? 'Update Dish' : 'Add Dish'}
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

export default DishForm;
