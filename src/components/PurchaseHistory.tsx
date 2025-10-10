import { useState, useEffect } from 'react';
import { Download, FileText } from 'lucide-react';
import { paymentAPI } from '../lib/api';

interface Purchase {
  id: string;
  total_amount: number;
  platform_fee: number;
  uploader_amount: number;
  created_at: string;
  items: Array<{
    id: string;
    title: string;
    course: string;
    file_size: number;
  }>;
}

export default function PurchaseHistory() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      const response = await paymentAPI.getUserPurchases();
      setPurchases(response.data.data || []);
    } catch (error) {
      console.error('Failed to load purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (itemId: string) => {
    try {
      setDownloading(itemId);
      const response = await paymentAPI.getDownloadUrl(itemId);
      window.open(response.data.data.url, '_blank');
    } catch (error) {
      console.error('Failed to get download URL:', error);
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600">Loading purchases...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Purchases</h2>

      {purchases.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No purchases yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Items you purchase will appear here for download
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase) => (
            <div key={purchase.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600">
                    {new Date(purchase.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    ₦{purchase.total_amount.toLocaleString()}
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  Completed
                </span>
              </div>

              <div className="space-y-3">
                {purchase.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.course}</p>
                    </div>
                    <button
                      onClick={() => handleDownload(item.id)}
                      disabled={downloading === item.id}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                    >
                      <Download className="w-4 h-4" />
                      <span>{downloading === item.id ? 'Loading...' : 'Download'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
