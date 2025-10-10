import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { LogIn, UserPlus, LogOut, Upload, ShoppingCart, FileText, DollarSign, Home } from 'lucide-react';
import Marketplace from './components/Marketplace';
import UploadForm from './components/UploadForm';
import PurchaseHistory from './components/PurchaseHistory';
import UploaderDashboard from './components/UploaderDashboard';
import { paymentAPI } from './lib/api';

type View = 'home' | 'marketplace' | 'upload' | 'purchases' | 'dashboard';

function App() {
  const { user, loading, login, register, logout } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('buyer');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentView, setCurrentView] = useState<View>('home');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        await login(email, password);
        setSuccess('Login successful!');
      } else {
        await register(email, password, fullName, role);
        setSuccess('Registration successful!');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setSuccess('Logged out successfully');
      setCurrentView('home');
    } catch (err: any) {
      setError('Logout failed');
    }
  };

  const handlePurchase = async (itemIds: string[]) => {
    try {
      const response = await paymentAPI.initializePayment(itemIds);
      const { authorization_url } = response.data.data;
      window.location.href = authorization_url;
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to initialize payment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 flex items-center justify-center">
        <div className="text-xl text-gray-700">Loading...</div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center space-x-2">
                <Upload className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Academic Notes</h1>
              </div>
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => setCurrentView('home')}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition ${
                    currentView === 'home'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </button>
                <button
                  onClick={() => setCurrentView('marketplace')}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition ${
                    currentView === 'marketplace'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Marketplace</span>
                </button>
                {user.role === 'uploader' && (
                  <>
                    <button
                      onClick={() => setCurrentView('upload')}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition ${
                        currentView === 'upload'
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload</span>
                    </button>
                    <button
                      onClick={() => setCurrentView('dashboard')}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition ${
                        currentView === 'dashboard'
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>Dashboard</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => setCurrentView('purchases')}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition ${
                    currentView === 'purchases'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Purchases</span>
                </button>
                <div className="flex items-center space-x-2 border-l pl-4">
                  <span className="text-sm text-gray-600">{user.email}</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {user.role}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {currentView === 'home' && (
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome, {user.full_name}!</h2>
              <p className="text-gray-600 mb-6">
                You're logged in as a <strong>{user.role}</strong>. Explore the marketplace or manage your content.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <button
                  onClick={() => setCurrentView('marketplace')}
                  className="border border-gray-200 rounded-lg p-6 text-left hover:border-blue-300 hover:shadow-md transition"
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <ShoppingCart className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900">Browse Marketplace</h3>
                  </div>
                  <p className="text-sm text-gray-600">Find and purchase quality academic materials</p>
                </button>

                {user.role === 'uploader' ? (
                  <button
                    onClick={() => setCurrentView('upload')}
                    className="border border-gray-200 rounded-lg p-6 text-left hover:border-blue-300 hover:shadow-md transition"
                  >
                    <div className="flex items-center space-x-2 mb-3">
                      <Upload className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">Upload Notes</h3>
                    </div>
                    <p className="text-sm text-gray-600">Share your academic notes with other students</p>
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentView('purchases')}
                    className="border border-gray-200 rounded-lg p-6 text-left hover:border-blue-300 hover:shadow-md transition"
                  >
                    <div className="flex items-center space-x-2 mb-3">
                      <FileText className="w-5 h-5 text-sky-600" />
                      <h3 className="font-semibold text-gray-900">My Purchases</h3>
                    </div>
                    <p className="text-sm text-gray-600">View and download your purchased materials</p>
                  </button>
                )}
              </div>

              {success && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                  {success}
                </div>
              )}
            </div>
          )}

          {currentView === 'marketplace' && <Marketplace onPurchase={handlePurchase} />}
          {currentView === 'upload' && user.role === 'uploader' && (
            <UploadForm onSuccess={() => setCurrentView('dashboard')} />
          )}
          {currentView === 'purchases' && <PurchaseHistory />}
          {currentView === 'dashboard' && user.role === 'uploader' && <UploaderDashboard />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Upload className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Academic Notes</h1>
          </div>

          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                isLogin
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <LogIn className="w-4 h-4 inline mr-2" />
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                !isLogin
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <UserPlus className="w-4 h-4 inline mr-2" />
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="buyer">Buyer</option>
                  <option value="uploader">Uploader</option>
                </select>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              {isLogin ? 'Login' : 'Register'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Backend API: <span className="text-green-600 font-medium">Connected</span></p>
            <p className="mt-1">Database: <span className="text-green-600 font-medium">Supabase</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
