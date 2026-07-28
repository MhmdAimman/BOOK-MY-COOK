import { useState, useEffect } from 'react';
import { bookingAPI } from '../../services/api';

const TIME_SLOTS = [
  { id: 1, label: 'Morning (6:00 AM - 10:00 AM)', start: '06:00', end: '10:00' },
  { id: 2, label: 'Mid-Morning (10:00 AM - 2:00 PM)', start: '10:00', end: '14:00' },
  { id: 3, label: 'Afternoon (2:00 PM - 6:00 PM)', start: '14:00', end: '18:00' },
  { id: 4, label: 'Evening (6:00 PM - 10:00 PM)', start: '18:00', end: '22:00' },
  { id: 5, label: 'Full Day (6:00 AM - 10:00 PM)', start: '06:00', end: '22:00' },
];

const TimeSlotPicker = ({ serviceId, selectedDate, selectedTime, onTimeSelect }) => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [useDefaultSlots, setUseDefaultSlots] = useState(true);

  useEffect(() => {
    if (serviceId && selectedDate) {
      loadAvailableSlots();
    }
  }, [serviceId, selectedDate]);

  const loadAvailableSlots = async () => {
    setLoading(true);
    try {
      const response = await bookingAPI.getAvailableSlots(serviceId, selectedDate);
      if (response.data.available_slots && response.data.available_slots.length > 0) {
        setAvailableSlots(response.data.available_slots);
        setUseDefaultSlots(false);
      } else {
        setAvailableSlots([]);
        setUseDefaultSlots(true);
      }
    } catch (error) {
      console.error('Failed to load available slots:', error);
      setUseDefaultSlots(true);
    } finally {
      setLoading(false);
    }
  };

  const slots = useDefaultSlots ? TIME_SLOTS : availableSlots;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Time Slot
      </label>
      
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {slots.map((slot) => {
            const slotTime = slot.start_time || slot.start;
            const isSelected = selectedTime === slotTime;
            
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => onTimeSelect(slotTime)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className={`font-medium ${isSelected ? 'text-primary-700' : 'text-gray-800'}`}>
                  {slot.label || `${slot.start_time || slot.start} - ${slot.end_time || slot.end}`}
                </p>
                {!useDefaultSlots && slot.is_available !== undefined && (
                  <p className="text-xs text-green-600 mt-1">Available</p>
                )}
              </button>
            );
          })}
        </div>
      )}
      
      {useDefaultSlots && (
        <p className="text-xs text-gray-500 mt-2">
          Default time slots shown. Provider can set custom availability.
        </p>
      )}
    </div>
  );
};

export default TimeSlotPicker;
