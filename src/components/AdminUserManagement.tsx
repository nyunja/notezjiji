import { useState, useEffect } from 'react';
import { Search, Users, Shield, Unlock, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import ConfirmDialog from './ConfirmDialog';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  failed_login_attempts: number;
  account_locked_until: string | null;
  created_at: string;
}

export default function AdminUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    loadUsers();
  }, [page, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          limit: 20,
          role: roleFilter || undefined,
          search: search || undefined
        }
      });

      setUsers(response.data.data.users);
      setTotalPages(response.data.data.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadUsers();
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;

    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(
        `${API_URL}/admin/users/${selectedUser.id}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowRoleDialog(false);
      setSelectedUser(null);
      setNewRole('');
      loadUsers();
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      alert(axiosError.response?.data?.message || 'Failed to update role');
    }
  };

  const handleUnlockAccount = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(
        `${API_URL}/admin/users/${selectedUser.id}/unlock`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowUnlockDialog(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      alert(axiosError.response?.data?.message || 'Failed to unlock account');
    }
  };

  const isAccountLocked = (user: User) => {
    if (!user.account_locked_until) return false;
    return new Date(user.account_locked_until) > new Date();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <p className="text-gray-600 mt-1">Manage users, roles, and permissions</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Roles</option>
            <option value="buyer">Buyer</option>
            <option value="uploader">Uploader</option>
            <option value="admin">Admin</option>
          </select>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Search
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No users found</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{user.full_name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-red-100 text-red-800'
                          : user.role === 'uploader'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {isAccountLocked(user) ? (
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                          Locked
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Active
                        </span>
                      )}
                      {user.failed_login_attempts > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {user.failed_login_attempts} failed attempts
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setNewRole(user.role);
                            setShowRoleDialog(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Change Role"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        {isAccountLocked(user) && (
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUnlockDialog(true);
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Unlock Account"
                          >
                            <Unlock className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {showRoleDialog && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Change User Role</h3>
            <p className="text-gray-600 mb-4">
              Update role for <strong>{selectedUser.full_name}</strong>
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="buyer">Buyer</option>
                <option value="uploader">Uploader</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setShowRoleDialog(false);
                  setSelectedUser(null);
                  setNewRole('');
                }}
                className="flex-1 py-2 px-4 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRole}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showUnlockDialog}
        title="Unlock Account"
        message={`Are you sure you want to unlock ${selectedUser?.full_name}'s account?`}
        type="warning"
        confirmText="Unlock"
        cancelText="Cancel"
        onConfirm={handleUnlockAccount}
        onCancel={() => {
          setShowUnlockDialog(false);
          setSelectedUser(null);
        }}
      />
    </div>
  );
}
