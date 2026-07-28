import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data: response } = await adminAPI.getAnalytics(period);
      setData(response);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const maxBookings = Math.max(...(data?.daily_bookings?.map(d => d.count) || [1]));
  const maxRevenue = Math.max(...(data?.daily_revenue?.map(d => d.revenue) || [1]));
  const maxUsers = Math.max(...(data?.daily_users?.map(d => d.count) || [1]));

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-8 bg-gray-100 min-h-screen">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
            <p className="text-gray-500">Platform performance metrics</p>
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Bookings</h3>
                <div className="h-48 flex items-end gap-1">
                  {data?.daily_bookings?.slice(-14).map((item, index) => (
                    <div
                      key={index}
                      className="flex-1 bg-primary-500 rounded-t"
                      style={{ height: `${(item.count / maxBookings) * 100}%` }}
                      title={`${item.date}: ${item.count} bookings`}
                    ></div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Revenue</h3>
                <div className="h-48 flex items-end gap-1">
                  {data?.daily_revenue?.slice(-14).map((item, index) => (
                    <div
                      key={index}
                      className="flex-1 bg-green-500 rounded-t"
                      style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
                      title={`${item.date}: ₹${item.revenue.toLocaleString()}`}
                    ></div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">New Users</h3>
                <div className="h-48 flex items-end gap-1">
                  {data?.daily_users?.slice(-14).map((item, index) => (
                    <div
                      key={index}
                      className="flex-1 bg-blue-500 rounded-t"
                      style={{ height: `${(item.count / maxUsers) * 100}%` }}
                      title={`${item.date}: ${item.count} users`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Services</h3>
                <div className="space-y-3">
                  {data?.top_services?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{item.title}</p>
                        <p className="text-sm text-gray-500">ID: {item.id}</p>
                      </div>
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                        {item.bookings} bookings
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Cities</h3>
                <div className="space-y-3">
                  {data?.top_cities?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-800">{item.city}</span>
                      <span className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm">
                        {item.bookings} bookings
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
