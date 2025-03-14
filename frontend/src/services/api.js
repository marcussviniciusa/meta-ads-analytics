import axios from 'axios';

// Usar a URL da API configurada no ambiente ou o domínio principal do projeto
const API_URL = process.env.REACT_APP_API_URL || 'https://api.speedfunnels.marcussviniciusa.cloud/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true // Habilitar envio de cookies nas requisições cross-origin
});

// Add request interceptor to add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log para depuração
    console.log(`Fazendo requisição para: ${config.baseURL}${config.url}`);
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle 401 unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erro na resposta da API:', error.response || error);
    
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
