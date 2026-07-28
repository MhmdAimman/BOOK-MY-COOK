import { useState, useEffect } from 'react';
import { availabilityAPI } from '../../services/api';
import Button from '../common/Button';

const AvailabilityManager = ({ serviceId }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [existingSlots, setExistingSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [timeSlotTemplates, setTimeSlotTemplates] = useState([]);

  useEffect(() => {
    loadTimeSlotTemplates();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadExistingSlots();
    }
  }, [selectedDate, serviceId]);

  const loadTimeSlotTemplates = async () => {
    try {
      const response = await availabilityAPI.getTimeSlots();
      setTimeSlotTemplates(response.data.slots || []);
    } catch (error) {
      console.error('Failed to load time slots:', error);
    }
  };

  const loadExistingSlots = async () => {
    setLoading(true);
    try {
      const response = await availabilityAPI.get(serviceId, { start_date: selectedDate, end_date: selectedDate });
      setExistingSlots(response.data.availability || []);
    } catch (error) {
      console.error('Failed to load slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSlot = () => {
    setSlots([...slots, { start_time: '09:00', end_time: '10:00', is_available: true }]);
  };

  const removeSlot = (index) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const updateSlot = (index, field, value) => {
    const updated = [...slots];
    updated[index] = { ...updated[index], [field]: value };
    setSlots(updated);
  };

  const addFromTemplate = (template) => {
    setSlots([...slots, { ...template, is_available: true }]);
  };

  const handleSave = async () => {
    if (!selectedDate || slots.length === 0) return;
    setSaving(true);
    try {
      await availabilityAPI.set(serviceId, {
        slots: slots.map(s => ({
          date: selectedDate,
          start_time: s.start_time,
          end_time: s.end_time,
          is_available: s.is_available
        }))
      });
      setSlots([]);
      loadExistingSlots();
    } catch (error) {
      console.error('Failed to save slots:', error);
      alert('Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Delete this availability slot?')) return;
    try {
      await availabilityAPI.delete(serviceId, slotId);
      loadExistingSlots();
    } catch (error) {
      console.error('Failed to delete slot:', error);
      alert('Failed to delete slot');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Date</h3>
        <input
          type="date"
          value={selectedDate || ''}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setSlots([]);
          }}
          min={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
        />
        {selectedDate && (
          <p className="mt-2 text-sm text-gray-500">{formatDate(selectedDate)}</p>
        )}
      </div>

      {selectedDate && (
        <>
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Existing Slots</h3>
            {loading ? (
              <div className="animate-pulse space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 bg-gray-200 rounded" />
                ))}
              </div>
            ) : existingSlots.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No slots set for this date</p>
            ) : (
              <div className="space-y-2">
                {existingSlots.map(slot => (
                  <div
                    key={slot.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      slot.is_available ? 'bg-green-50' : 'bg-yellow-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full ${
                        slot.is_available ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                      <span className="font-medium text-gray-800">
                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                      </span>
                      {slot.booking_id && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Booked
                        </span>
                      )}
                    </div>
                    {!slot.booking_id && (
                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="text-red-500 hover:text-red-600 text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Slots</h3>

            {timeSlotTemplates.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Quick add from templates:</p>
                <div className="flex flex-wrap gap-2">
                  {timeSlotTemplates.slice(0, 6).map((template, i) => (
                    <button
                      key={i}
                      onClick={() => addFromTemplate(template)}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      {formatTime(template.start_time)} - {formatTime(template.end_time)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {slots.length > 0 && (
              <div className="space-y-3 mb-4">
                {slots.map((slot, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="time"
                      value={slot.start_time}
                      onChange={(e) => updateSlot(index, 'start_time', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="time"
                      value={slot.end_time}
                      onChange={(e) => updateSlot(index, 'end_time', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                    <button
                      onClick={() => removeSlot(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={addSlot}>
                + Add Custom Slot
              </Button>
              {slots.length > 0 && (
                <Button variant="primary" onClick={handleSave} loading={saving}>
                  Save Slots
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AvailabilityManager;
