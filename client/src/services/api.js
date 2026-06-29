import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Attaches the access token to every outgoing request
api.interceptors.request.use((config) => {
  const token = window.__accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response Interceptor ─────────────────────────────────────────────────────
// Handles 401 responses: attempts token refresh, retries the original request
// Full implementation will be wired in Phase 2 (Authentication)
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Don't intercept the refresh request itself — let AuthContext handle it
    const isRefreshRequest = original.url?.includes('/api/auth/refresh');
    if (isRefreshRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = data.data.accessToken;
        window.__accessToken = newToken;
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        window.__accessToken = null;
        // Only redirect if not already on a public auth page
        const path = window.location.pathname;
        if (path !== '/login' && path !== '/register' && path !== '/') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
