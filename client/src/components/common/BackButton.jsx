import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ label = 'Back', className = '' }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className={`flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors ${className}`}
    >
      <ArrowLeftIcon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );
};

export default BackButton;
