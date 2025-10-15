import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, DollarSign, Clock } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

interface PendingPayout {
  id: string;
  amount: number;
  bank_code: string;
  account_number: string;
  account_name: string;
  created_at: string;
  uploader: {
    full_name: string;
    email: string;
  };
}

export default function AdminPayoutApproval() {
  const [payouts, setPayouts] = useState<PendingPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  useEffect(() => {
    loadPendingPayouts();
  }, []);

  const loadPendingPayouts = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/admin/payouts/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayouts(response.data.data.payouts);
    } catch (error) {
      console.error('Failed to load pending payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (payoutId: string) => {
    if (!confirm('Are you sure you want to approve this payout?')) return;

    try {
      setProcessing(payoutId);
      const token = localStorage.getItem('accessToken');
      await axios.post(
        `${API_URL}/admin/payouts/${payoutId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPayouts(payouts.filter(payout => payout.id !== payoutId));
      alert('Payout approved successfully');
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      alert(axiosError.response?.data?.message || 'Failed to approve payout');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (payoutId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      setProcessing(payoutId);
      const token = localStorage.getItem('accessToken');
      await axios.post(
        `${API_URL}/admin/payouts/${payoutId}/reject`,
        { reason: rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPayouts(payouts.filter(payout => payout.id !== payoutId));
      setRejectingId(null);
      setRejectionReason('');
      alert('Payout rejected successfully');
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      alert(axiosError.response?.data?.message || 'Failed to reject payout');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600">Loading pending payouts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Payout Approvals</h2>
        <p className="text-gray-600 mt-1">Review and approve withdrawal requests</p>
      </div>

      {payouts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No pending payouts</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payouts.map((payout) => (
            <div key={payout.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <DollarSign className="w-6 h-6 text-green-600" />
                    <h3 className="text-2xl font-bold text-gray-900">
                      ₦{Number(payout.amount).toLocaleString()}
                    </h3>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <strong>Uploader:</strong> {payout.uploader.full_name} ({payout.uploader.email})
                    </p>
                    <p>
                      <strong>Account Name:</strong> {payout.account_name}
                    </p>
                    <p>
                      <strong>Account Number:</strong> {payout.account_number}
                    </p>
                    <p>
                      <strong>Bank Code:</strong> {payout.bank_code}
                    </p>
                    <p>
                      <strong>Requested:</strong>{' '}
                      {new Date(payout.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {rejectingId === payout.id ? (
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={3}
                    placeholder="Explain why this payout is being rejected..."
                  />
                  <div className="flex items-center space-x-3 mt-3">
                    <button
                      onClick={() => handleReject(payout.id)}
                      disabled={processing === payout.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:bg-gray-400"
                    >
                      {processing === payout.id ? 'Processing...' : 'Confirm Rejection'}
                    </button>
                    <button
                      onClick={() => {
                        setRejectingId(null);
                        setRejectionReason('');
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3 mt-4">
                  <button
                    onClick={() => handleApprove(payout.id)}
                    disabled={processing === payout.id}
                    className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{processing === payout.id ? 'Processing...' : 'Approve'}</span>
                  </button>
                  <button
                    onClick={() => setRejectingId(payout.id)}
                    className="flex items-center space-x-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
