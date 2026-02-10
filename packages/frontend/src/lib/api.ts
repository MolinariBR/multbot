import axios from 'axios';

const defaultBaseURL = import.meta.env.DEV
  ? 'http://localhost:3000/api'
  : '/api';

// Criar instância Axios configurada
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultBaseURL,
  withCredentials: true
});

// Interceptor para adicionar token JWT em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros (incluindo 401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Se 401, limpar token e redirecionar para login
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('adminEmail');
      localStorage.removeItem('adminName');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { api };
