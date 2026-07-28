import StarRating from './StarRating';

const ReviewCard = ({ review }) => {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-100">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-medium">
              {review.user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="ml-3">
            <p className="font-medium text-gray-800">{review.user?.name || 'Anonymous'}</p>
            <p className="text-xs text-gray-400">
              {new Date(review.created_at).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
        <StarRating rating={review.rating} readonly size="sm" />
      </div>
      {review.comment && (
        <p className="text-gray-600 text-sm mt-2">{review.comment}</p>
      )}
    </div>
  );
};

export default ReviewCard;
