import axios from 'axios';

function resolveBaseURL() {
  if (import.meta.env.DEV) return '/api';

  let url = String(import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
  if (!url) {
    console.error('VITE_API_URL is not set for production');
    return '/api';
  }
  // Ensure requests go to /api/... on the Render host
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
}

const api = axios.create({ baseURL: resolveBaseURL() });

api.interceptors.request.use((config) => {
  if (config.url === '/admin/login') return config;
  const isAdminRoute = config.url?.startsWith('/admin');
  const tokenKey = isAdminRoute ? 'adminToken' : 'token';
  const token = localStorage.getItem(tokenKey);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
