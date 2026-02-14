import { useState, useEffect } from 'react';
import { Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { paymentAPI } from '../lib/api';
import { getErrorMessage } from '../lib/errorUtils';

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
    file_path: string;
    file_size: number;
    page_count?: number;
  };
  download_count: number;
  max_downloads: number;
}

export default function PurchaseHistory() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<{ [key: string]: number }>({});
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      const response = await paymentAPI.getUserPurchases();
      setPurchases(response.data.data || []);
    } catch (error) {
      console.error('Failed to load purchases:', error);
      setError('Failed to load your purchases. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (itemId: string, itemTitle: string) => {
    try {
      setDownloading(itemId);
      setError(null);
      setDownloadProgress({ ...downloadProgress, [itemId]: 0 });

      const response = await paymentAPI.getDownloadUrl(itemId);
      const downloadUrl = response.data.data.url;

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          const current = prev[itemId] || 0;
          if (current >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return { ...prev, [itemId]: current + 10 };
        });
      }, 100);

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = itemTitle;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      clearInterval(progressInterval);
      setDownloadProgress({ ...downloadProgress, [itemId]: 100 });

      // Update download count locally
      setPurchases(purchases.map(p =>
        p.item.id === itemId
          ? { ...p, download_count: p.download_count + 1 }
          : p
      ));

      setSuccessMessage(`Successfully downloaded "${itemTitle}"`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to download file:', error);
      setError(getErrorMessage(error, 'Failed to download file. Please try again.'));
      setTimeout(() => setError(null), 5000);
    } finally {
      setDownloading(null);
      setTimeout(() => {
        setDownloadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[itemId];
          return newProgress;
        });
      }, 2000);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileInfo = (item: Purchase['item']): string => {
    const parts: string[] = [];

    if (item.file_size) {
      parts.push(formatFileSize(item.file_size));
    }

    if (item.page_count) {
      parts.push(`${item.page_count} pages`);
    }

    return parts.length > 0 ? parts.join(' • ') : 'PDF';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Purchases</h2>
        <div className="text-sm text-gray-600">
          {purchases.length} {purchases.length === 1 ? 'item' : 'items'}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        </div>
      )}

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
            <div key={purchase.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
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
                    <span className="font-medium text-gray-700">₦{Number(purchase.amount).toLocaleString()}</span>
                    <span>•</span>
                    <span>
                      Downloads: {purchase.download_count}/{purchase.max_downloads}
                      {purchase.download_count >= purchase.max_downloads && (
                        <span className="ml-1 text-red-600">(Limit reached)</span>
                      )}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(purchase.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <span>•</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {getFileInfo(purchase.item)}
                    </span>
                  </div>

                  {downloadProgress[purchase.item.id] !== undefined && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${downloadProgress[purchase.item.id]}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Downloading... {downloadProgress[purchase.item.id]}%
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDownload(purchase.item.id, purchase.item.title)}
                  disabled={downloading === purchase.item.id || purchase.download_count >= purchase.max_downloads}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {downloading === purchase.item.id
                      ? 'Preparing...'
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
