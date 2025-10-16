import { useState, useEffect } from 'react';
import { DollarSign, FileText, Download } from 'lucide-react';
import { itemsAPI, paymentAPI } from '../lib/api';

interface Stats {
  totalEarnings: number;
  availableBalance: number;
  totalItems: number;
  totalDownloads: number;
}

interface Item {
  id: string;
  title: string;
  course: string;
  price: number;
  status: string;
  approval_status: string;
  download_count: number;
  created_at: string;
}

export default function UploaderDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalEarnings: 0,
    availableBalance: 0,
    totalItems: 0,
    totalDownloads: 0
  });
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [itemsResponse, earningsResponse, statsResponse] = await Promise.all([
        itemsAPI.getUserItems(),
        paymentAPI.getUploaderEarnings(),
        itemsAPI.getItemStats()
      ]);

      setItems(itemsResponse.data.data || []);

      const earnings = earningsResponse.data.data;
      setStats({
        totalEarnings: earnings.total_earnings || 0,
        availableBalance: earnings.available_balance || 0,
        totalItems: statsResponse.data.data.total_items || 0,
        totalDownloads: statsResponse.data.data.total_downloads || 0
      });
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Uploader Dashboard</h2>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">
                ₦{stats.totalEarnings.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Available Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                ₦{stats.availableBalance.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-sky-100 rounded-lg">
              <FileText className="w-6 h-6 text-sky-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Download className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Downloads</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDownloads}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">My Items</h3>

        {items.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No items uploaded yet</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.course}</p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      ₦{item.price.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600">
                      {item.download_count} downloads
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      item.approval_status
                    )}`}
                  >
                    {item.approval_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
