import { useState, useEffect } from 'react';
import { availabilityAPI } from '../../services/api';

const BookingCalendar = ({ serviceId, onSlotSelect, selectedSlot }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    loadCalendarData();
  }, [serviceId, currentMonth]);

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDate, serviceId]);

  const loadCalendarData = async () => {
    if (!serviceId) return;
    setLoading(true);
    try {
      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();
      const response = await availabilityAPI.getCalendar(serviceId, month, year);
      setCalendarData(response.data.calendar || {});
    } catch (error) {
      console.error('Failed to load calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async () => {
    setLoadingSlots(true);
    try {
      const response = await availabilityAPI.getAvailable(serviceId, selectedDate);
      setAvailableSlots(response.data.available_slots || []);
    } catch (error) {
      console.error('Failed to load slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDateKey = (year, month, day) => {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isPastDate = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const hasAvailability = (day) => {
    const dateKey = formatDateKey(currentMonth.getFullYear(), currentMonth.getMonth() + 1, day);
    const data = calendarData[dateKey];
    return data && data.available > 0;
  };

  const handleDateClick = (day) => {
    if (isPastDate(day) || !hasAvailability(day)) return;
    const dateKey = formatDateKey(currentMonth.getFullYear(), currentMonth.getMonth() + 1, day);
    setSelectedDate(dateKey);
    setAvailableSlots([]);
  };

  const handleSlotClick = (slot) => {
    if (onSlotSelect) {
      onSlotSelect({
        date: selectedDate,
        slot: slot
      });
    }
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    setSelectedDate(null);
    setAvailableSlots([]);
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    setSelectedDate(null);
    setAvailableSlots([]);
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-lg font-semibold text-gray-800">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-10" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const past = isPastDate(day);
              const today = isToday(day);
              const available = hasAvailability(day);
              const isSelected = selectedDate === formatDateKey(currentMonth.getFullYear(), currentMonth.getMonth() + 1, day);

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  disabled={past || !available}
                  className={`
                    h-10 rounded-lg text-sm font-medium transition-all duration-200
                    ${isSelected ? 'bg-primary-500 text-white ring-2 ring-primary-500 ring-offset-1' : ''}
                    ${today && !isSelected ? 'border-2 border-primary-400' : ''}
                    ${past ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : ''}
                    ${!past && available && !isSelected ? 'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer' : ''}
                    ${!past && !available && !isSelected ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 rounded" />
              <span className="text-gray-600">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 rounded" />
              <span className="text-gray-600">No slots</span>
            </div>
          </div>
        </div>
      </div>

      {selectedDate && (
        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Available Slots for {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </h3>

          {loadingSlots ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            </div>
          ) : availableSlots.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No slots available for this date</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableSlots.map((slot, index) => {
                const isSelected = selectedSlot && selectedSlot.date === selectedDate && selectedSlot.slot?.id === slot.id;
                return (
                  <button
                    key={slot.id || index}
                    onClick={() => handleSlotClick(slot)}
                    className={`
                      p-3 rounded-lg border-2 transition-all duration-200 text-center
                      ${isSelected 
                        ? 'border-primary-500 bg-primary-50 text-primary-700' 
                        : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <p className="font-medium">{formatTime(slot.start_time)}</p>
                    <p className="text-sm text-gray-500">to {formatTime(slot.end_time)}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingCalendar;
