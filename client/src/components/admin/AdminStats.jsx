import { UserGroupIcon, UserIcon, CakeIcon, CalendarIcon, CurrencyRupeeIcon, StarIcon } from '@heroicons/react/24/outline';

const AdminStats = ({ stats }) => {
  if (!stats) return null;

  const statCards = [
    { label: 'Total Users', value: stats.total_users, Icon: UserGroupIcon, color: 'bg-blue-500' },
    { label: 'Providers', value: stats.total_providers, Icon: UserIcon, color: 'bg-green-500' },
    { label: 'Services', value: stats.total_services, Icon: CakeIcon, color: 'bg-purple-500' },
    { label: 'Bookings', value: stats.total_bookings, Icon: CalendarIcon, color: 'bg-orange-500' },
    { label: 'Revenue', value: `Rs.${stats.total_revenue?.toLocaleString() || 0}`, Icon: CurrencyRupeeIcon, color: 'bg-yellow-500' },
    { label: 'Reviews', value: stats.total_reviews, Icon: StarIcon, color: 'bg-pink-500' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.Icon;
        return (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md p-4 border-l-4"
            style={{ borderLeftColor: stat.color.replace('bg-', '').replace('-500', '') }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-full flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminStats;
