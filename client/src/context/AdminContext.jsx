import { useState, useEffect, createContext, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { adminAPI } from '../services/api';

const AdminContext = createContext(null);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.role === 'admin';

  const fetchStats = async () => {
    if (!isAdmin) return;
    try {
      setLoading(true);
      const { data } = await adminAPI.getDashboard();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  const value = {
    stats,
    loading,
    isAdmin,
    fetchStats,
  };

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContext;
