import { Link } from 'react-router-dom';
import BookingStatusBadge from './BookingStatusBadge';

const BookingCard = ({ booking, showActions = false, onConfirm, onReject, onCancel }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
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
    <div className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <Link to={`/bookings/${booking.id}`} className="text-lg font-semibold text-gray-800 hover:text-primary-500">
            {booking.service?.title || 'Service Booking'}
          </Link>
          <p className="text-sm text-gray-500 mt-1">
            Booking #{booking.id}
          </p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500">Event Date</p>
          <p className="font-medium text-gray-800">{formatDate(booking.event_date)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Event Time</p>
          <p className="font-medium text-gray-800">{formatTime(booking.event_time)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Guests</p>
          <p className="font-medium text-gray-800">{booking.number_of_guests || 'N/A'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Amount</p>
          <p className="font-medium text-primary-600">₹{booking.total_amount?.toLocaleString() || 'N/A'}</p>
        </div>
      </div>

      {booking.event_type && (
        <div className="mb-3">
          <span className="text-xs bg-secondary-50 text-secondary-700 px-2 py-1 rounded-full">
            {booking.event_type}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          {booking.customer ? (
            <span>Customer: {booking.customer.name}</span>
          ) : booking.provider ? (
            <span>Provider: {booking.provider.name}</span>
          ) : null}
        </div>
        
        {showActions && booking.status === 'pending' && (
          <div className="flex gap-2">
            <button
              onClick={() => onConfirm(booking.id)}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Confirm
            </button>
            <button
              onClick={() => onReject(booking.id)}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Reject
            </button>
          </div>
        )}
        
        {showActions && ['pending', 'confirmed'].includes(booking.status) && (
          <button
            onClick={() => onCancel(booking.id)}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
