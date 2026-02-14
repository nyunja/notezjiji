import { useState } from 'react';
import { User, Mail, Shield, Calendar, Key, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { getErrorMessage } from '../lib/errorUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export default function UserProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(
        `${API_URL}/auth/profile`,
        { full_name: fullName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage('Profile updated successfully!');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to update profile'));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(
        `${API_URL}/auth/password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to change password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
        <p className="text-gray-600 mt-1">Manage your account information and security</p>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <User className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{user?.email}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                <Shield className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 capitalize">{user?.role}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Member Since
              </label>
              <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">
                  {user && user.created_at
                    ? new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'N/A'}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Key className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                minLength={8}
              />
              <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:bg-gray-400"
            >
              <Key className="w-4 h-4" />
              <span>{loading ? 'Changing...' : 'Change Password'}</span>
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">0</p>
            <p className="text-sm text-gray-600">Active Sessions</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">0</p>
            <p className="text-sm text-gray-600">Total Purchases</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">0</p>
            <p className="text-sm text-gray-600">Items Uploaded</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">₦0</p>
            <p className="text-sm text-gray-600">Total Spent</p>
          </div>
        </div>
      </div>
    </div>
  );
}
