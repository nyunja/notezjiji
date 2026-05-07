import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { LogIn, UserPlus, Upload, BookOpen, ShoppingCart } from 'lucide-react';
import Marketplace from './components/Marketplace';
import UploadForm from './components/UploadForm';
import PurchaseHistory from './components/PurchaseHistory';
import UploaderDashboard from './components/UploaderDashboard';
import PaymentCallback from './components/PaymentCallback';
import AdminDashboard from './components/AdminDashboard';
import AdminItemApproval from './components/AdminItemApproval';
import AdminPayoutApproval from './components/AdminPayoutApproval';
import AdminUserManagement from './components/AdminUserManagement';
import UserProfile from './components/UserProfile';
import Sidebar from './components/Sidebar';
import DashboardHeader from './components/DashboardHeader';
import AnimatedPage from './components/AnimatedPage';
import { AnimatePresence } from 'framer-motion';
import { paymentAPI } from './lib/api';

import { getErrorMessage } from './lib/errorUtils';

type View = 'home' | 'marketplace' | 'upload' | 'purchases' | 'dashboard' | 'payment-callback' | 'admin-dashboard' | 'admin-items' | 'admin-payouts' | 'admin-users' | 'profile';

function App() {
  const { user, loading, login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('buyer');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentView, setCurrentView] = useState<View>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('reference')) {
      setCurrentView('payment-callback');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        await login(email, password);
        setSuccess('Login successful!');
        setCurrentView('home');
      } else {
        await register(email, password, fullName, role);
        setSuccess('Registration successful!');
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'An error occurred'));
    }
  };

  const handlePurchase = async (itemIds: string[]) => {
    try {
      const response = await paymentAPI.initializePayment(itemIds);
      const { authorization_url } = response.data.data;
      window.location.href = authorization_url;
    } catch (error: unknown) {
      alert(getErrorMessage(error, 'Failed to initialize payment'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0C10] flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex bg-slate-50 dark:bg-[#0A0C10]">
        <Sidebar 
          currentView={currentView} 
          setCurrentView={setCurrentView} 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen} 
        />
        
        <div className={`flex-1 flex flex-col transition-all duration-500 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
          <DashboardHeader />
          
          <main className="p-8 overflow-y-auto max-h-[calc(100vh-80px)] no-scrollbar">
            <AnimatePresence mode="wait">
              <AnimatedPage key={currentView}>
                {currentView === 'home' && (
                  <div className="premium-card p-10 max-w-4xl mx-auto overflow-visible relative">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl"></div>
                    
                    <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                      Welcome back, <span className="text-indigo-600 dark:text-indigo-400">{user.full_name}</span>!
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-2xl">
                      You're in the right place to level up your academics. Explore premium notes or share your own knowledge with the community.
                    </p>

                    <div className="grid md:grid-cols-2 gap-8">
                      <button
                        onClick={() => setCurrentView('marketplace')}
                        className="group premium-card p-8 text-left hover:border-indigo-500/50 bg-gradient-to-br from-white to-indigo-50/30 dark:from-slate-900/40 dark:to-indigo-900/10"
                      >
                        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                          <BookOpen className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Explore Marketplace</h3>
                        <p className="text-slate-600 dark:text-slate-400">Discover hand-crafted academic materials from top students.</p>
                      </button>

                      {user.role === 'uploader' ? (
                        <button
                          onClick={() => setCurrentView('upload')}
                          className="group premium-card p-8 text-left hover:border-violet-500/50 bg-gradient-to-br from-white to-violet-50/30 dark:from-slate-900/40 dark:to-violet-900/10"
                        >
                          <div className="w-14 h-14 bg-violet-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-violet-500/30 group-hover:scale-110 transition-transform">
                            <Upload className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Upload Your Work</h3>
                          <p className="text-slate-600 dark:text-slate-400">Share your expertise and start earning from your notes.</p>
                        </button>
                      ) : (
                        <button
                          onClick={() => setCurrentView('purchases')}
                          className="group premium-card p-8 text-left hover:border-emerald-500/50 bg-gradient-to-br from-white to-emerald-50/30 dark:from-slate-900/40 dark:to-emerald-900/10"
                        >
                          <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                            <ShoppingCart className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">My Library</h3>
                          <p className="text-slate-600 dark:text-slate-400">Access and manage all your purchased materials in one place.</p>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {currentView === 'payment-callback' && (
                  <PaymentCallback onComplete={() => setCurrentView('purchases')} />
                )}
                {currentView === 'marketplace' && <Marketplace onPurchase={handlePurchase} />}
                {currentView === 'upload' && user.role === 'uploader' && (
                  <UploadForm onSuccess={() => setCurrentView('dashboard')} />
                )}
                {currentView === 'purchases' && <PurchaseHistory />}
                {currentView === 'dashboard' && user.role === 'uploader' && <UploaderDashboard />}
                {currentView === 'admin-dashboard' && user.role === 'admin' && <AdminDashboard />}
                {currentView === 'admin-items' && user.role === 'admin' && <AdminItemApproval />}
                {currentView === 'admin-payouts' && user.role === 'admin' && <AdminPayoutApproval />}
                {currentView === 'admin-users' && user.role === 'admin' && <AdminUserManagement />}
                {currentView === 'profile' && <UserProfile />}
              </AnimatedPage>
            </AnimatePresence>
          </main>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0C10] flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-slide-up">
        <div className="glass rounded-[2rem] shadow-2xl p-10 border-white/40">
          <div className="flex flex-col items-center justify-center mb-10">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Notezjiji</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Empowering your academic journey</p>
          </div>

          <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all duration-300 ${
                isLogin
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              <LogIn className="w-4 h-4 inline mr-2" />
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all duration-300 ${
                !isLogin
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              <UserPlus className="w-4 h-4 inline mr-2" />
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@example.com"
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
                required
              />
            </div>

            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                  I want to...
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white appearance-none"
                >
                  <option value="buyer">Buy Notes</option>
                  <option value="uploader">Upload & Earn</option>
                </select>
              </div>
            )}

            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-sm font-medium animate-shake">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                {success}
              </div>
            )}

            <button
              type="submit"
              className="btn-premium w-full py-4 text-lg"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
