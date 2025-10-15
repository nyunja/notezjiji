import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { paymentAPI } from '../lib/api';

interface PaymentCallbackProps {
  onComplete: () => void;
}

export default function PaymentCallback({ onComplete }: PaymentCallbackProps) {
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    const verifyPayment = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const reference = urlParams.get('reference');

      if (!reference) {
        setStatus('failed');
        setMessage('No payment reference found');
        return;
      }

      try {
        const response = await paymentAPI.verifyPayment(reference);

        if (response.data.success) {
          setStatus('success');
          setMessage('Payment successful! Your purchase is ready.');
          setTimeout(() => {
            onComplete();
          }, 3000);
        } else {
          setStatus('failed');
          setMessage('Payment verification failed');
        }
      } catch (error: unknown) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        setStatus('failed');
        setMessage(axiosError.response?.data?.message || 'Payment verification failed');
      }
    };

    verifyPayment();
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center">
        {status === 'verifying' && (
          <>
            <Loader className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                Redirecting you to your purchases...
              </p>
            </div>
          </>
        )}

        {status === 'failed' && (
          <>
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={onComplete}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Return to Marketplace
            </button>
          </>
        )}
      </div>
    </div>
  );
}
