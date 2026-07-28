import { useState, useEffect } from 'react';
import { reviewAPI } from '../../services/api';
import ReviewCard from './ReviewCard';
import StarRating from './StarRating';
import Button from '../common/Button';

const ReviewList = ({ serviceId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [avgRating, setAvgRating] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [serviceId, page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data } = await reviewAPI.getByService(serviceId, { page, per_page: 5 });
      setReviews(data.reviews);
      setTotalPages(data.pages);
      setAvgRating(data.average_rating);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Reviews</h3>
        {total > 0 && (
          <div className="flex items-center gap-2">
            <StarRating rating={Math.round(avgRating)} readonly size="sm" />
            <span className="text-sm text-gray-600">
              {avgRating.toFixed(1)} ({total} reviews)
            </span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No reviews yet</p>
      ) : (
        <>
          <div className="space-y-3">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="ghost"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-500 py-1">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReviewList;
