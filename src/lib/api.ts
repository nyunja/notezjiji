import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't attempt token refresh for auth endpoints (login, register, refresh)
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
                          originalRequest.url?.includes('/auth/register') ||
                          originalRequest.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: { email: string; password: string; full_name: string; role: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),
  me: () =>
    api.get('/auth/me'),
  getSessions: () =>
    api.get('/auth/sessions'),
  revokeSession: (sessionId: string) =>
    api.delete(`/auth/sessions/${sessionId}`)
};

export const itemsAPI = {
  getMarketplace: (params?: unknown) =>
    api.get('/items/marketplace', { params }),
  getItem: (id: string) =>
    api.get(`/items/${id}`),
  getUserItems: () =>
    api.get('/items/my-items'),
  getItemStats: () =>
    api.get('/items/stats'),
  createItem: (data: FormData) =>
    api.post('/items', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  updateItem: (id: string, data: unknown) =>
    api.put(`/items/${id}`, data),
  deleteItem: (id: string) =>
    api.delete(`/items/${id}`)
};

export const paymentAPI = {
  initializePayment: (itemIds: string[]) =>
    api.post('/payments/initialize', { itemIds }),
  verifyPayment: (reference: string) =>
    api.get(`/payments/verify/${reference}`),
  getUserPurchases: () =>
    api.get('/payments/purchases'),
  getDownloadUrl: (itemId: string) =>
    api.get(`/payments/download/${itemId}`),
  getUploaderEarnings: () =>
    api.get('/payments/earnings')
};

export default api;
