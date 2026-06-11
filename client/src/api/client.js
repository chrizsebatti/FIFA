import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

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
