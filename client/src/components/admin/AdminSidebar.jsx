import { NavLink } from 'react-router-dom';
import { ChartBarIcon, UserGroupIcon, CakeIcon, CalendarIcon, MapPinIcon, ChartPieIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const AdminSidebar = () => {
  const menuItems = [
    { path: '/admin', label: 'Dashboard', Icon: ChartBarIcon },
    { path: '/admin/users', label: 'Users', Icon: UserGroupIcon },
    { path: '/admin/services', label: 'Services', Icon: CakeIcon },
    { path: '/admin/bookings', label: 'Bookings', Icon: CalendarIcon },
    { path: '/admin/locations', label: 'Locations', Icon: MapPinIcon },
    { path: '/admin/analytics', label: 'Analytics', Icon: ChartPieIcon },
  ];

  return (
    <aside className="w-64 bg-gray-800 min-h-screen">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white">Admin Panel</h1>
        <p className="text-sm text-gray-400">BOOKMYCOOK</p>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.Icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/admin'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-500 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-gray-700">
        <a
          href="/"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back to Site</span>
        </a>
      </div>
    </aside>
  );
};

export default AdminSidebar;
