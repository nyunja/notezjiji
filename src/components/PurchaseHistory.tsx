import { useState, useEffect } from 'react';
import { Download, FileText } from 'lucide-react';
import { paymentAPI } from '../lib/api';

interface Purchase {
  id: string;
  amount: number;
  created_at: string;
  item: {
    id: string;
    title: string;
    course: string;
    year: string;
    thumbnail_path: string;
  };
  download_count: number;
  max_downloads: number;
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
              <div className="flex items-center space-x-4">
                {purchase.item.thumbnail_path && (
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                    <img
                      src={purchase.item.thumbnail_path}
                      alt={purchase.item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{purchase.item.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {purchase.item.course} • {purchase.item.year}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>₦{Number(purchase.amount).toLocaleString()}</span>
                    <span>•</span>
                    <span>Downloads: {purchase.download_count}/{purchase.max_downloads}</span>
                    <span>•</span>
                    <span>
                      {new Date(purchase.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(purchase.item.id)}
                  disabled={downloading === purchase.item.id || purchase.download_count >= purchase.max_downloads}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {downloading === purchase.item.id
                      ? 'Loading...'
                      : purchase.download_count >= purchase.max_downloads
                      ? 'Limit Reached'
                      : 'Download'}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
