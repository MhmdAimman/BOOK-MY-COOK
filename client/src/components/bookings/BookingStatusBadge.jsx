import { ClockIcon, CheckIcon, XMarkIcon, CreditCardIcon } from '@heroicons/react/24/outline';

const STATUS_CONFIG = {
  pending: { label: 'Requested', color: 'bg-yellow-100 text-yellow-800', Icon: ClockIcon },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', Icon: CheckIcon },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', Icon: XMarkIcon },
  payment_pending: { label: 'Payment Pending', color: 'bg-orange-100 text-orange-800', Icon: CreditCardIcon },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-800', Icon: CheckIcon },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800', Icon: CheckIcon },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', Icon: XMarkIcon },
};

const BookingStatusBadge = ({ status, size = 'md' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.Icon;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${config.color} ${sizeClasses[size]}`}>
      <Icon className={`mr-1 ${iconSizes[size]}`} />
      {config.label}
    </span>
  );
};

export default BookingStatusBadge;
