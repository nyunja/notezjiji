import { useState, useEffect } from 'react';
import { itemsAPI } from '../lib/api';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';

interface UploaderStats {
  totalItems: number;
  totalEarnings: number;
  pendingWithdrawals: number;
  approvedItems: number;
  pendingItems: number;
}

export default function UploaderDashboard() {
  const [stats, setStats] = useState<UploaderStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await itemsAPI.getUploaderStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to load uploader stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

  const StatCard = ({ label, value, icon: Icon, color, trend }: any) => (
    <div className="premium-card-static p-6 overflow-visible relative">
      <div className={`absolute -top-3 -right-3 w-12 h-12 rounded-2xl bg-${color}-500/10 dark:bg-${color}-500/20 flex items-center justify-center text-${color}-600 dark:text-${color}-400 shadow-lg shadow-${color}-500/10`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100">{value}</h3>
      {trend && (
        <div className="flex items-center space-x-1 mt-2 text-emerald-500">
          <TrendingUp className="w-3 h-3" />
          <span className="text-[10px] font-black uppercase tracking-tighter">{trend} increase</span>
        </div>
      )}
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

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-4xl font-black text-slate-900 dark:text-slate-100 mb-2">Creator Dashboard</h2>
        <p className="text-slate-500 dark:text-slate-400">Track your performance and manage your academic assets.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Earnings" 
          value={formatCurrency(stats?.totalEarnings || 0)} 
          icon={DollarSign} 
          color="indigo"
          trend="12%"
        />
        <StatCard 
          label="Total Items" 
          value={stats?.totalItems || 0} 
          icon={CheckCircle2} 
          color="emerald"
        />
        <StatCard 
          label="Pending Approval" 
          value={stats?.pendingItems || 0} 
          icon={Clock} 
          color="amber"
        />
        <StatCard 
          label="Withdrawals" 
          value={formatCurrency(stats?.pendingWithdrawals || 0)} 
          icon={Wallet} 
          color="violet"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Performance Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Performance Overview</h3>
            <button className="text-sm font-bold text-indigo-600 hover:underline flex items-center space-x-1">
              <span>View detailed report</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="premium-card-static p-8 h-64 flex items-center justify-center border-dashed border-2">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
              <p className="text-slate-400 font-bold">Analytics charts will appear here as your notes gain traction.</p>
            </div>
          </div>
        </div>

        {/* Quick Tips/Info */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Pro Tips</h3>
          <div className="space-y-4">
            {[
              { title: 'Optimize Titles', desc: 'Use clear, descriptive titles including course codes.', icon: AlertCircle, color: 'indigo' },
              { title: 'Add Tags', desc: 'Items with 5+ relevant tags sell 40% faster.', icon: TrendingUp, color: 'emerald' },
              { title: 'Quality Matters', desc: 'High-resolution PDFs are preferred by buyers.', icon: CheckCircle2, color: 'violet' }
            ].map((tip, i) => (
              <div key={i} className="premium-card-static p-4 flex items-start space-x-4 hover:border-slate-300 dark:hover:border-slate-700">
                <div className={`p-2 rounded-lg bg-${tip.color}-500/10 text-${tip.color}-600 dark:text-${tip.color}-400`}>
                  <tip.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{tip.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Internal Wallet icon for Payouts
const Wallet = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/>
    <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/>
    <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/>
  </svg>
);
