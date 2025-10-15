import { useState, useEffect } from 'react';
import { Users, FileText, DollarSign, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

interface Stats {
  users: {
    total: number;
    buyers: number;
    uploaders: number;
    admins: number;
  };
  items: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  revenue: {
    total: number;
    transactions: number;
  };
  payouts: {
    pending: number;
    completed: number;
    totalPaid: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Failed to load dashboard stats
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <p className="text-gray-600 mt-1">Overview of platform activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.users.total}</p>
              <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                <span>{stats.users.buyers} buyers</span>
                <span>•</span>
                <span>{stats.users.uploaders} uploaders</span>
              </div>
            </div>
            <Users className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Items</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.items.total}</p>
              <div className="flex items-center space-x-2 mt-3">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                  {stats.items.pending} pending
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                  {stats.items.approved} approved
                </span>
              </div>
            </div>
            <FileText className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ₦{stats.revenue.total.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-3">
                {stats.revenue.transactions} transactions
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Payouts</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ₦{stats.payouts.totalPaid.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-3">
                {stats.payouts.pending} pending approval
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Item Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="text-gray-700">Pending Approval</span>
              </div>
              <span className="font-bold text-gray-900">{stats.items.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Approved</span>
              </div>
              <span className="font-bold text-gray-900">{stats.items.approved}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-gray-700">Rejected</span>
              </div>
              <span className="font-bold text-gray-900">{stats.items.rejected}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Active Users</span>
              <span className="font-bold text-gray-900">{stats.users.buyers + stats.users.uploaders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Approval Rate</span>
              <span className="font-bold text-gray-900">
                {stats.items.total > 0
                  ? Math.round((stats.items.approved / stats.items.total) * 100)
                  : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Avg Transaction</span>
              <span className="font-bold text-gray-900">
                ₦{stats.revenue.transactions > 0
                  ? Math.round(stats.revenue.total / stats.revenue.transactions).toLocaleString()
                  : 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
