import { dishPlaceholder } from '../../utils/placeholders';

const DishCard = ({ dish }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-40">
        <img
          src={dish.image_url || dishPlaceholder}
          alt={dish.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = dishPlaceholder;
          }}
        />
        <div className="absolute top-2 left-2">
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              dish.is_veg
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {dish.is_veg ? '🥬 Veg' : '🍖 Non-Veg'}
          </span>
        </div>
      </div>
      <div className="p-3">
        <h4 className="font-semibold text-gray-800 mb-1">{dish.name}</h4>
        {dish.cuisine_type && (
          <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">
            {dish.cuisine_type}
          </span>
        )}
        {dish.description && (
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">
            {dish.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default DishCard;
