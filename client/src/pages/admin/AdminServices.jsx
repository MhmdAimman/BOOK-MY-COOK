import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTable from '../../components/admin/AdminTable';
import Button from '../../components/common/Button';

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    search: '',
  });
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    current_page: 1,
  });

  useEffect(() => {
    fetchServices();
  }, [filters, pagination.current_page]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current_page,
        per_page: 20,
      };
      if (filters.type) params.type = filters.type;
      if (filters.status) params.status = filters.status;
      if (filters.search) params.q = filters.search;

      const { data } = await adminAPI.getServices(params);
      setServices(data.services);
      setPagination({
        total: data.total,
        pages: data.pages,
        current_page: data.current_page,
      });
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (serviceId) => {
    try {
      await adminAPI.verifyService(serviceId);
      fetchServices();
    } catch (err) {
      console.error('Failed to verify service:', err);
    }
  };

  const handleUnverify = async (serviceId) => {
    try {
      await adminAPI.unverifyService(serviceId);
      fetchServices();
    } catch (err) {
      console.error('Failed to unverify service:', err);
    }
  };

  const handleActivate = async (serviceId) => {
    try {
      await adminAPI.activateService(serviceId);
      fetchServices();
    } catch (err) {
      console.error('Failed to activate service:', err);
    }
  };

  const handleDeactivate = async (serviceId) => {
    try {
      await adminAPI.deactivateService(serviceId);
      fetchServices();
    } catch (err) {
      console.error('Failed to deactivate service:', err);
    }
  };

  const columns = [
    {
      header: 'Service',
      render: (service) => (
        <div>
          <p className="font-medium text-gray-800">{service.title}</p>
          <p className="text-sm text-gray-500">{service.provider?.name}</p>
        </div>
      ),
    },
    {
      header: 'Type',
      render: (service) => (
        <span className={`px-2 py-1 text-xs rounded-full capitalize ${
          service.service_type === 'chef' ? 'bg-green-100 text-green-700' :
          service.service_type === 'caterer' ? 'bg-blue-100 text-blue-700' :
          'bg-purple-100 text-purple-700'
        }`}>
          {service.service_type}
        </span>
      ),
    },
    {
      header: 'Price',
      render: (service) => (
        <span className="font-medium text-gray-800">
          ₹{service.price_per_event?.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Rating',
      render: (service) => (
        <div className="flex items-center gap-1">
          <span className="text-yellow-500">★</span>
          <span>{service.rating?.toFixed(1) || 'N/A'}</span>
          <span className="text-gray-400 text-sm">({service.total_reviews})</span>
        </div>
      ),
    },
    {
      header: 'Status',
      render: (service) => (
        <div className="flex gap-1">
          {service.is_verified && (
            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
              Verified
            </span>
          )}
          {!service.is_active && (
            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
              Inactive
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'City',
      accessor: 'city',
    },
  ];

  const actions = (service) => (
    <>
      {!service.is_verified && (
        <Button size="sm" variant="ghost" onClick={() => handleVerify(service.id)}>
          Verify
        </Button>
      )}
      {service.is_verified && (
        <Button size="sm" variant="ghost" onClick={() => handleUnverify(service.id)}>
          Unverify
        </Button>
      )}
      {service.is_active ? (
        <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDeactivate(service.id)}>
          Deactivate
        </Button>
      ) : (
        <Button size="sm" variant="ghost" className="text-green-500" onClick={() => handleActivate(service.id)}>
          Activate
        </Button>
      )}
    </>
  );

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-8 bg-gray-100 min-h-screen">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Service Management</h1>
          <p className="text-gray-500">Manage all services on the platform</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Types</option>
                <option value="chef">Chef</option>
                <option value="caterer">Caterer</option>
                <option value="decorator">Decorator</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search services..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
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
            <AdminTable columns={columns} data={services} actions={actions} />

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

export default AdminServices;
