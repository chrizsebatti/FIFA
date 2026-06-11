import axios from 'axios';

const RENDER_API = 'https://fifa-sl3t.onrender.com/api';

function getBaseURL() {
  if (!import.meta.env.PROD) return '/api';
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl?.startsWith('http')) return envUrl;
  return RENDER_API;
}

const api = axios.create({ baseURL: getBaseURL() });

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
