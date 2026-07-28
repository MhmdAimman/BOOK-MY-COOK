import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTable from '../../components/admin/AdminTable';
import Button from '../../components/common/Button';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    service_type: '',
    start_date: '',
    end_date: '',
  });
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    current_page: 1,
  });

  useEffect(() => {
    fetchBookings();
  }, [filters, pagination.current_page]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current_page,
        per_page: 20,
      };
      if (filters.status) params.status = filters.status;
      if (filters.service_type) params.service_type = filters.service_type;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;

      const { data } = await adminAPI.getBookings(params);
      setBookings(data.bookings);
      setPagination({
        total: data.total,
        pages: data.pages,
        current_page: data.current_page,
      });
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await adminAPI.updateBookingStatus(bookingId, newStatus);
      fetchBookings();
    } catch (err) {
      console.error('Failed to update booking status:', err);
    }
  };

  const columns = [
    {
      header: 'Event',
      render: (booking) => (
        <div>
          <p className="font-medium text-gray-800">{booking.event_type}</p>
          <p className="text-sm text-gray-500">{booking.service?.title}</p>
        </div>
      ),
    },
    {
      header: 'Customer',
      render: (booking) => (
        <div>
          <p className="font-medium text-gray-800">{booking.customer?.name}</p>
          <p className="text-sm text-gray-500">{booking.customer?.email}</p>
        </div>
      ),
    },
    {
      header: 'Provider',
      render: (booking) => (
        <div>
          <p className="font-medium text-gray-800">{booking.provider?.name}</p>
          <p className="text-sm text-gray-500">{booking.provider?.email}</p>
        </div>
      ),
    },
    {
      header: 'Date',
      render: (booking) => (
        <div>
          <p className="text-gray-800">{new Date(booking.event_date).toLocaleDateString()}</p>
          <p className="text-sm text-gray-500">{booking.event_time}</p>
        </div>
      ),
    },
    {
      header: 'Guests',
      accessor: 'number_of_guests',
    },
    {
      header: 'Amount',
      render: (booking) => (
        <span className="font-medium text-gray-800">
          ₹{booking.total_amount?.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (booking) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          booking.status === 'completed' ? 'bg-green-100 text-green-700' :
          booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
          booking.status === 'paid' ? 'bg-purple-100 text-purple-700' :
          booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {booking.status}
        </span>
      ),
    },
  ];

  const actions = (booking) => (
    <select
      value={booking.status}
      onChange={(e) => handleStatusChange(booking.id, e.target.value)}
      className="px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
    >
      <option value="pending">Pending</option>
      <option value="confirmed">Confirmed</option>
      <option value="rejected">Rejected</option>
      <option value="payment_pending">Payment Pending</option>
      <option value="paid">Paid</option>
      <option value="completed">Completed</option>
      <option value="cancelled">Cancelled</option>
    </select>
  );

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-8 bg-gray-100 min-h-screen">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Booking Management</h1>
          <p className="text-gray-500">Oversee all bookings on the platform</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="rejected">Rejected</option>
                <option value="payment_pending">Payment Pending</option>
                <option value="paid">Paid</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
              <select
                value={filters.service_type}
                onChange={(e) => setFilters({ ...filters, service_type: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Types</option>
                <option value="chef">Chef</option>
                <option value="caterer">Caterer</option>
                <option value="decorator">Decorator</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <>
            <AdminTable columns={columns} data={bookings} actions={actions} />

            {pagination.pages > 1 && (
              <div className="flex justify-center mt-6 gap-2">
                <Button
                  variant="ghost"
                  disabled={pagination.current_page === 1}
                  onClick={() => setPagination({ ...pagination, current_page: pagination.current_page - 1 })}
                >
                  Previous
                </Button>
                <span className="py-2 px-4 text-gray-600">
                  Page {pagination.current_page} of {pagination.pages}
                </span>
                <Button
                  variant="ghost"
                  disabled={pagination.current_page === pagination.pages}
                  onClick={() => setPagination({ ...pagination, current_page: pagination.current_page + 1 })}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminBookings;
