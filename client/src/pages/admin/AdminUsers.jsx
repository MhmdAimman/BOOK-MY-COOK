import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTable from '../../components/admin/AdminTable';
import Button from '../../components/common/Button';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: '',
  });
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    current_page: 1,
  });

  useEffect(() => {
    fetchUsers();
  }, [filters, pagination.current_page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current_page,
        per_page: 20,
      };
      if (filters.role) params.role = filters.role;
      if (filters.status) params.status = filters.status;
      if (filters.search) params.q = filters.search;

      const { data } = await adminAPI.getUsers(params);
      setUsers(data.users);
      setPagination({
        total: data.total,
        pages: data.pages,
        current_page: data.current_page,
      });
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId) => {
    try {
      await adminAPI.verifyUser(userId);
      fetchUsers();
    } catch (err) {
      console.error('Failed to verify user:', err);
    }
  };

  const handleUnverify = async (userId) => {
    try {
      await adminAPI.unverifyUser(userId);
      fetchUsers();
    } catch (err) {
      console.error('Failed to unverify user:', err);
    }
  };

  const handleActivate = async (userId) => {
    try {
      await adminAPI.activateUser(userId);
      fetchUsers();
    } catch (err) {
      console.error('Failed to activate user:', err);
    }
  };

  const handleDeactivate = async (userId) => {
    try {
      await adminAPI.deactivateUser(userId);
      fetchUsers();
    } catch (err) {
      console.error('Failed to deactivate user:', err);
    }
  };

  const columns = [
    {
      header: 'User',
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-medium">
              {user.full_name?.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-800">{user.full_name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (user) => (
        <span className={`px-2 py-1 text-xs rounded-full capitalize ${
          user.role === 'admin' ? 'bg-red-100 text-red-700' :
          user.role === 'chef' ? 'bg-green-100 text-green-700' :
          user.role === 'caterer' ? 'bg-blue-100 text-blue-700' :
          user.role === 'decorator' ? 'bg-purple-100 text-purple-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {user.role}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (user) => (
        <div className="flex gap-1">
          {user.is_verified && (
            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
              Verified
            </span>
          )}
          {!user.is_active && (
            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
              Inactive
            </span>
          )}
          {user.is_active && !user.is_verified && (
            <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
              Unverified
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Phone',
      accessor: 'phone',
    },
    {
      header: 'Joined',
      render: (user) => new Date(user.created_at).toLocaleDateString(),
    },
  ];

  const actions = (user) => (
    <>
      {!user.is_verified && (
        <Button size="sm" variant="ghost" onClick={() => handleVerify(user.id)}>
          Verify
        </Button>
      )}
      {user.is_verified && (
        <Button size="sm" variant="ghost" onClick={() => handleUnverify(user.id)}>
          Unverify
        </Button>
      )}
      {user.is_active ? (
        <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDeactivate(user.id)}>
          Deactivate
        </Button>
      ) : (
        <Button size="sm" variant="ghost" className="text-green-500" onClick={() => handleActivate(user.id)}>
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
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-500">Manage all users on the platform</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Roles</option>
                <option value="customer">Customer</option>
                <option value="chef">Chef</option>
                <option value="caterer">Caterer</option>
                <option value="decorator">Decorator</option>
                <option value="admin">Admin</option>
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
                placeholder="Search by name, email, phone..."
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
            <AdminTable columns={columns} data={users} actions={actions} />

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

export default AdminUsers;
