import axios from 'axios';

const api = axios.create({
  // 🔥 PONEMOS LA URL DE PRODUCCIÓN DIRECTA AQUÍ
  // (La terminación /api/v1 es importante porque así la definimos en el backend)
  baseURL: 'https://tu-vecino-api.onrender.com/api/v1', 
});

// Interceptor: Antes de cada petición, pega el Token si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;