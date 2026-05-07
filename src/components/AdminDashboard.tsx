import { useState, useEffect } from 'react';
import { Users, FileText, DollarSign, TrendingUp, CheckCircle, XCircle, Clock, Shield, ArrowRight } from 'lucide-react';
import { adminAPI } from '../lib/api';

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
      const response = await adminAPI.getStats();
      setStats(response.data.data);
    } catch (error) {

      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ label, value, icon: Icon, color, subtext }: any) => (
    <div className="premium-card p-6 relative overflow-visible">
      <div className={`absolute -top-3 -right-3 w-12 h-12 rounded-2xl bg-${color}-500/10 dark:bg-${color}-500/20 flex items-center justify-center text-${color}-600 dark:text-${color}-400 shadow-lg shadow-${color}-500/10`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100">{value}</h3>
      {subtext && <p className="text-xs font-bold text-slate-500 mt-2">{subtext}</p>}
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-12 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-10">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20">
          <Shield className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-slate-100 mb-1">Command Center</h2>
          <p className="text-slate-500 dark:text-slate-400">Platform-wide overview and administrative controls.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Users" 
          value={stats.users.total} 
          icon={Users} 
          color="indigo"
          subtext={`${stats.users.uploaders} Uploaders • ${stats.users.buyers} Buyers`}
        />
        <StatCard 
          label="Items" 
          value={stats.items.total} 
          icon={FileText} 
          color="emerald"
          subtext={`${stats.items.pending} Awaiting Review`}
        />
        <StatCard 
          label="Revenue" 
          value={`₦${stats.revenue.total.toLocaleString()}`} 
          icon={TrendingUp} 
          color="violet"
          subtext={`${stats.revenue.transactions} Transactions`}
        />
        <StatCard 
          label="Paid Out" 
          value={`₦${stats.payouts.totalPaid.toLocaleString()}`} 
          icon={DollarSign} 
          color="rose"
          subtext={`${stats.payouts.pending} Pending Payouts`}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="premium-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Item Status Breakdown</h3>
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
                <Clock className="w-5 h-5" />
                <span className="font-bold">Pending Review</span>
              </div>
              <span className="text-xl font-black text-amber-500">{stats.items.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-bold">Approved Notez</span>
              </div>
              <span className="text-xl font-black text-emerald-500">{stats.items.approved}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
                <XCircle className="w-5 h-5" />
                <span className="font-bold">Rejected Content</span>
              </div>
              <span className="text-xl font-black text-rose-500">{stats.items.rejected}</span>
            </div>
          </div>
          <button className="w-full mt-10 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center space-x-2">
            <span>Manage All Items</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="premium-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Platform Health</h3>
            <TrendingUp className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400 font-bold">Content Approval Rate</span>
              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                {stats.items.total > 0 ? Math.round((stats.items.approved / stats.items.total) * 100) : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400 font-bold">Average Order Value</span>
              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                ₦{stats.revenue.transactions > 0 ? Math.round(stats.revenue.total / stats.revenue.transactions).toLocaleString() : 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400 font-bold">Creator Participation</span>
              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                {stats.users.total > 0 ? Math.round((stats.users.uploaders / stats.users.total) * 100) : 0}%
              </span>
            </div>
          </div>
          <button className="w-full mt-10 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center space-x-2">
            <span>Download Full Audit</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
