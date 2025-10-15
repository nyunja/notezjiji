import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

interface PendingItem {
  id: string;
  title: string;
  course: string;
  year: string;
  description: string;
  price: number;
  created_at: string;
  uploader: {
    full_name: string;
    email: string;
  };
}

export default function AdminItemApproval() {
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  useEffect(() => {
    loadPendingItems();
  }, []);

  const loadPendingItems = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/admin/items/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(response.data.data.items);
    } catch (error) {
      console.error('Failed to load pending items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (itemId: string) => {
    if (!confirm('Are you sure you want to approve this item?')) return;

    try {
      setProcessing(itemId);
      const token = localStorage.getItem('accessToken');
      await axios.post(
        `${API_URL}/admin/items/${itemId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setItems(items.filter(item => item.id !== itemId));
      alert('Item approved successfully');
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      alert(axiosError.response?.data?.message || 'Failed to approve item');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (itemId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      setProcessing(itemId);
      const token = localStorage.getItem('accessToken');
      await axios.post(
        `${API_URL}/admin/items/${itemId}/reject`,
        { reason: rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setItems(items.filter(item => item.id !== itemId));
      setRejectingId(null);
      setRejectionReason('');
      alert('Item rejected successfully');
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      alert(axiosError.response?.data?.message || 'Failed to reject item');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600">Loading pending items...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Item Approvals</h2>
        <p className="text-gray-600 mt-1">Review and approve submitted items</p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No pending items</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {item.course} • {item.year}
                  </p>
                  <p className="text-gray-700 mt-3">{item.description}</p>

                  <div className="flex items-center space-x-4 mt-4 text-sm">
                    <span className="text-gray-600">
                      Uploaded by: <strong>{item.uploader.full_name}</strong> ({item.uploader.email})
                    </span>
                    <span>•</span>
                    <span className="text-gray-600">
                      {new Date(item.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                <div className="text-right ml-6">
                  <p className="text-2xl font-bold text-gray-900">₦{Number(item.price).toLocaleString()}</p>
                </div>
              </div>

              {rejectingId === item.id ? (
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={3}
                    placeholder="Explain why this item is being rejected..."
                  />
                  <div className="flex items-center space-x-3 mt-3">
                    <button
                      onClick={() => handleReject(item.id)}
                      disabled={processing === item.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:bg-gray-400"
                    >
                      {processing === item.id ? 'Processing...' : 'Confirm Rejection'}
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
                    onClick={() => handleApprove(item.id)}
                    disabled={processing === item.id}
                    className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{processing === item.id ? 'Processing...' : 'Approve'}</span>
                  </button>
                  <button
                    onClick={() => setRejectingId(item.id)}
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
