import { useState } from 'react';
import { paymentAPI } from '../../services/api';
import Button from '../common/Button';

const PaymentForm = ({ bookingId, amount, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState(null);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError('');

      const { data } = await paymentAPI.createOrder({ booking_id: bookingId });
      setOrderId(data.order.order_id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order');
      setLoading(false);
    }
  };

  const handleMockPayment = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      setError('');

      await paymentAPI.mockSuccess(orderId);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h4 className="font-semibold text-gray-800 mb-4">Payment</h4>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="mb-4">
        <p className="text-gray-600">Amount to pay:</p>
        <p className="text-2xl font-bold text-primary-600">
          ₹{amount?.toLocaleString() || '0'}
        </p>
      </div>

      {!orderId ? (
        <Button onClick={handlePayment} loading={loading} className="w-full">
          Proceed to Pay
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Mock Mode:</strong> Click below to simulate a successful payment.
            </p>
          </div>
          <Button onClick={handleMockPayment} loading={loading} className="w-full">
            Complete Payment (Mock)
          </Button>
          {onCancel && (
            <Button variant="ghost" onClick={onCancel} className="w-full">
              Cancel
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentForm;
