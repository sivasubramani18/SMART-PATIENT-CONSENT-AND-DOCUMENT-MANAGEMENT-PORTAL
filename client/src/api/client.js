import axios from 'axios';

// Backend API configuration:
// All backend routes are served under /api (e.g. /api/auth, /api/documents)
const rawBaseUrl = import.meta.env.VITE_API_URL || '';
export const API_BASE_URL = rawBaseUrl
  ? `${rawBaseUrl.replace(/\/+$/, '').replace(/\/api$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Resolves full URL for static assets, PDF streams, or file downloads
 */
export const getFullApiUrl = (path = '') => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
    return path;
  }
  const serverOrigin = rawBaseUrl.replace(/\/+$/, '').replace(/\/api$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return serverOrigin ? `${serverOrigin}${cleanPath}` : cleanPath;
};

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('consentiq_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if expired or unauthorized
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('consentiq_token');
        localStorage.removeItem('consentiq_user');
        window.location.href = '/login?expired=1';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
