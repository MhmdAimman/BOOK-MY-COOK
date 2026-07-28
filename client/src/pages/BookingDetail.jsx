import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  CreditCardIcon, 
  BanknotesIcon, 
  CheckCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import BookingStatusBadge from '../components/bookings/BookingStatusBadge';
import { bookingAPI, paymentAPI, reviewAPI } from '../services/api';
import Button from '../components/common/Button';
import PaymentForm from '../components/payments/PaymentForm';
import BackButton from '../components/common/BackButton';

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [payment, setPayment] = useState(null);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    loadBooking();
  }, [id]);

  useEffect(() => {
    if (booking) {
      loadPayment();
      checkReview();
    }
  }, [booking]);

  const loadBooking = async () => {
    try {
      const response = await bookingAPI.getById(id);
      setBooking(response.data.booking);
    } catch (error) {
      console.error('Failed to load booking:', error);
      navigate('/bookings');
    } finally {
      setLoading(false);
    }
  };

  const loadPayment = async () => {
    try {
      const response = await paymentAPI.getByBooking(booking.id);
      const paidPayment = response.data.payments.find(p => p.status === 'paid');
      if (paidPayment) setPayment(paidPayment);
    } catch (error) {
      console.error('Failed to load payment:', error);
    }
  };

  const checkReview = async () => {
    try {
      const response = await reviewAPI.canReview(booking.id);
      setHasReviewed(!response.data.can_review);
    } catch (error) {
      console.error('Failed to check review:', error);
    }
  };

  const handleConfirm = async () => {
    if (!window.confirm('Confirm this booking?')) return;
    setActionLoading(true);
    try {
      await bookingAPI.confirm(booking.id);
      loadBooking();
    } catch (error) {
      console.error('Failed to confirm:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Enter rejection reason (optional):');
    if (!window.confirm('Reject this booking?')) return;
    setActionLoading(true);
    try {
      await bookingAPI.reject(booking.id, { reason });
      loadBooking();
    } catch (error) {
      console.error('Failed to reject:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    const reason = prompt('Enter cancellation reason:');
    if (!reason || !window.confirm('Cancel this booking?')) return;
    setActionLoading(true);
    try {
      await bookingAPI.cancel(booking.id, { reason });
      loadBooking();
    } catch (error) {
      console.error('Failed to cancel:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!window.confirm('Mark this booking as completed?')) return;
    setActionLoading(true);
    try {
      await bookingAPI.complete(booking.id);
      loadBooking();
    } catch (error) {
      console.error('Failed to complete:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCashPayment = async () => {
    if (!window.confirm(`Confirm that you have received cash payment of ₹${booking.total_amount?.toLocaleString()}?`)) return;
    setActionLoading(true);
    try {
      await paymentAPI.markCashPayment(booking.id);
      loadBooking();
      loadPayment();
    } catch (error) {
      console.error('Failed to mark cash payment:', error);
      alert(error.response?.data?.message || 'Failed to record payment');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    loadBooking();
    loadPayment();
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    try {
      await reviewAPI.create({
        booking_id: booking.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      setHasReviewed(true);
      loadBooking();
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 text-center">
        <h2 className="text-xl font-semibold text-gray-800">Booking not found</h2>
        <div className="mt-4">
          <BackButton label="Back to bookings" />
        </div>
      </div>
    );
  }

  const isCustomer = user?.id === booking.customer_id;
  const isProviderUser = user?.id === booking.provider_id;
  const canConfirm = isProviderUser && booking.status === 'pending';
  const canReject = isProviderUser && booking.status === 'pending';
  const canCancel = (isCustomer || isProviderUser) && ['pending', 'confirmed'].includes(booking.status);
  const canComplete = isProviderUser && booking.status === 'paid';
  const showPaymentForm = isCustomer && ['confirmed', 'payment_pending'].includes(booking.status);
  const showPaymentReceipt = payment && ['paid', 'completed'].includes(booking.status);
  const canMarkCashPayment = isProviderUser && ['confirmed', 'payment_pending'].includes(booking.status);
  const showReviewForm = isCustomer && booking.status === 'completed' && !hasReviewed;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <BackButton label="Back to bookings" />
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {booking.service?.title || 'Service Booking'}
            </h1>
            <p className="text-gray-500 mt-1">Booking #{booking.id}</p>
          </div>
          <BookingStatusBadge status={booking.status} size="lg" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Event Details</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium text-gray-800">{formatDate(booking.event_date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium text-gray-800">{formatTime(booking.event_time)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Event Type</p>
                <p className="font-medium text-gray-800">{booking.event_type || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Number of Guests</p>
                <p className="font-medium text-gray-800">{booking.number_of_guests}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Location</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium text-gray-800">{booking.event_address || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">City</p>
                <p className="font-medium text-gray-800">{booking.city || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Area</p>
                <p className="font-medium text-gray-800">{booking.area || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {booking.special_requirements && (
          <div className="mt-6 pt-6 border-t">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Special Requirements</h2>
            <p className="text-gray-600">{booking.special_requirements}</p>
          </div>
        )}
      </div>

      {/* Payment Summary */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Summary</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Base Amount</span>
            <span className="font-medium">₹{booking.base_amount?.toLocaleString() || '0'}</span>
          </div>
          {booking.extra_charges > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Extra Charges</span>
              <span className="font-medium">₹{booking.extra_charges?.toLocaleString()}</span>
            </div>
          )}
          <hr />
          <div className="flex justify-between text-lg">
            <span className="font-semibold">Total Amount</span>
            <span className="font-bold text-primary-600">₹{booking.total_amount?.toLocaleString() || '0'}</span>
          </div>
        </div>
      </div>

      {/* Payment Form for Customer */}
      {showPaymentForm && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CreditCardIcon className="w-6 h-6 text-primary-600" />
            Payment
          </h2>
          <PaymentForm
            bookingId={booking.id}
            amount={booking.total_amount}
            onSuccess={handlePaymentSuccess}
          />
        </div>
      )}

      {/* Cash Payment Option for Provider */}
      {canMarkCashPayment && (
        <div className="bg-yellow-50 rounded-xl p-6 mb-6 border border-yellow-200">
          <h2 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center gap-2">
            <BanknotesIcon className="w-6 h-6 text-yellow-600" />
            Cash Payment
          </h2>
          <p className="text-yellow-700 mb-4">
            If customer has paid in cash, mark the payment as received.
          </p>
          <div className="bg-white rounded-lg p-4 mb-4">
            <p className="text-gray-600">Amount to collect:</p>
            <p className="text-2xl font-bold text-yellow-700">
              ₹{booking.total_amount?.toLocaleString()}
            </p>
          </div>
          <Button
            onClick={handleCashPayment}
            loading={actionLoading}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            ✓ Mark as Paid by Cash
          </Button>
        </div>
      )}

      {/* Payment Receipt */}
      {showPaymentReceipt && (
        <div className={`rounded-xl p-6 mb-6 border ${
          payment.payment_method === 'cash'
            ? 'bg-yellow-50 border-yellow-200'
            : 'bg-green-50 border-green-200'
        }`}>
          <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
            payment.payment_method === 'cash' ? 'text-yellow-800' : 'text-green-800'
          }`}>
            {payment.payment_method === 'cash' 
              ? <BanknotesIcon className="w-6 h-6" />
              : <CheckCircleIcon className="w-6 h-6" />
            }
            {payment.payment_method === 'cash' ? 'Cash Payment Received' : 'Payment Successful'}
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Payment Method</p>
              <p className="font-medium flex items-center gap-1">
                {payment.payment_method === 'cash' 
                  ? <><BanknotesIcon className="w-4 h-4" /> Cash</>
                  : <><CreditCardIcon className="w-4 h-4" /> Online</>
                }
              </p>
            </div>
            <div>
              <p className="text-gray-500">Amount Paid</p>
              <p className={`font-bold ${payment.payment_method === 'cash' ? 'text-yellow-700' : 'text-green-700'}`}>
                ₹{payment.amount?.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Order ID</p>
              <p className="font-medium">{payment.order_id}</p>
            </div>
            <div>
              <p className="text-gray-500">Date</p>
              <p className="font-medium">{new Date(payment.created_at).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Review Form for Customer */}
      {showReviewForm && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircleIcon className="w-6 h-6 text-green-500" />
            Event Completed! Leave a Review
          </h2>
          <form onSubmit={handleReviewSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    className={`transition-transform hover:scale-110 ${
                      star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    <StarIcon className={`w-8 h-8 ${star <= reviewForm.rating ? 'fill-yellow-400' : ''}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Comment (Optional)</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="Share your experience..."
              />
            </div>
            <Button type="submit" loading={reviewLoading} className="w-full">
              Submit Review
            </Button>
          </form>
        </div>
      )}

      {/* Already Reviewed Message */}
      {isCustomer && booking.status === 'completed' && hasReviewed && (
        <div className="bg-green-50 rounded-xl p-6 mb-6 border border-green-200">
          <p className="text-green-800 flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5" />
            Thank you for your review!
          </p>
        </div>
      )}

      {/* Contact Information */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {isCustomer ? 'Provider' : 'Customer'} Information
        </h2>
        <div className="flex items-center">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-medium text-lg">
              {(isCustomer ? booking.provider?.name : booking.customer?.name)?.charAt(0)}
            </span>
          </div>
          <div className="ml-4">
            <p className="font-medium text-gray-800">
              {isCustomer ? booking.provider?.name : booking.customer?.name}
            </p>
            <p className="text-sm text-gray-500">
              {isCustomer ? booking.provider?.email : booking.customer?.email}
            </p>
            <p className="text-sm text-gray-500">
              {isCustomer ? booking.provider?.phone : booking.customer?.phone}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {(canConfirm || canReject || canCancel || canComplete) && (
        <div className="flex flex-wrap gap-3">
          {canConfirm && (
            <Button
              variant="primary"
              onClick={handleConfirm}
              loading={actionLoading}
              className="flex-1"
            >
              Confirm Booking
            </Button>
          )}
          {canReject && (
            <Button
              variant="outline"
              onClick={handleReject}
              loading={actionLoading}
              className="flex-1 text-red-500 border-red-500 hover:bg-red-50"
            >
              Reject
            </Button>
          )}
          {canComplete && (
            <Button
              variant="primary"
              onClick={handleComplete}
              loading={actionLoading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Mark as Completed
            </Button>
          )}
          {canCancel && (
            <Button
              variant="ghost"
              onClick={handleCancel}
              loading={actionLoading}
              className="text-red-500"
            >
              Cancel Booking
            </Button>
          )}
        </div>
      )}

      {booking.status === 'rejected' && booking.rejection_reason && (
        <div className="mt-6 p-4 bg-red-50 rounded-lg">
          <p className="text-sm text-red-800">
            <span className="font-medium">Rejection Reason:</span> {booking.rejection_reason}
          </p>
        </div>
      )}

      {booking.status === 'cancelled' && booking.cancellation_reason && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-800">
            <span className="font-medium">Cancellation Reason:</span> {booking.cancellation_reason}
          </p>
        </div>
      )}
    </div>
  );
};

export default BookingDetail;
