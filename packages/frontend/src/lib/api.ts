import axios from 'axios';

const defaultBaseURL = import.meta.env.DEV
  ? 'http://localhost:3000/api'
  : '/api';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultBaseURL,
  withCredentials: true
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
    if (error.response?.status === 401) {
      console.error('Token expirado ou inválido, redirecionando para login:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('adminEmail');
      localStorage.removeItem('adminName');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { api };
