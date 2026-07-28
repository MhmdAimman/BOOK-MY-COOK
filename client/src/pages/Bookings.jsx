import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BookingList from '../components/bookings/BookingList';
import { bookingAPI } from '../services/api';

const Bookings = () => {
  const { user, isProvider } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    current_page: 1,
    has_next: false,
    has_prev: false,
  });

  const statusFilter = searchParams.get('status') || '';
  const page = searchParams.get('page') || 1;

  useEffect(() => {
    loadBookings();
  }, [statusFilter, page]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: 10,
        status: statusFilter || undefined,
        role: isProvider ? 'provider' : undefined,
      };
      
      const response = await bookingAPI.getAll(params);
      setBookings(response.data.bookings);
      setPagination({
        total: response.data.total,
        pages: response.data.pages,
        current_page: response.data.current_page,
        has_next: response.data.has_next,
        has_prev: response.data.has_prev,
      });
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (status) => {
    setSearchParams({ status, page: 1 });
  };

  const handleConfirm = async (bookingId) => {
    try {
      await bookingAPI.confirm(bookingId);
      loadBookings();
    } catch (error) {
      console.error('Failed to confirm booking:', error);
    }
  };

  const handleReject = async (bookingId) => {
    if (!window.confirm('Are you sure you want to reject this booking?')) return;
    try {
      await bookingAPI.reject(bookingId);
      loadBookings();
    } catch (error) {
      console.error('Failed to reject booking:', error);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingAPI.cancel(bookingId);
      loadBookings();
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {isProvider ? 'Booking Requests' : 'My Bookings'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isProvider
              ? 'Manage booking requests from customers'
              : 'View and manage your service bookings'}
          </p>
        </div>
        <Link
          to="/services"
          className="text-primary-500 hover:text-primary-600 font-medium"
        >
          Browse Services
        </Link>
      </div>

      <BookingList
        bookings={bookings}
        loading={loading}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        showActions={isProvider}
        onConfirm={handleConfirm}
        onReject={handleReject}
        onCancel={handleCancel}
      />

      {pagination.pages > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          <button
            onClick={() => setSearchParams({ status: statusFilter, page: pagination.current_page - 1 })}
            disabled={!pagination.has_prev}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-600">
            Page {pagination.current_page} of {pagination.pages}
          </span>
          <button
            onClick={() => setSearchParams({ status: statusFilter, page: pagination.current_page + 1 })}
            disabled={!pagination.has_next}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Bookings;
