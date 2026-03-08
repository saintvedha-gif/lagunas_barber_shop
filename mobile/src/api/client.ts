import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = 'https://lagunas-barber-shop.onrender.com';

const client = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 30000,
});

// Adjuntar JWT en cada request
client.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Manejar 401 globalmente
client.interceptors.response.use(
  res => res,
  async error => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('auth_token');
      // El store de auth detectará el token vacío al reiniciar
    }
    return Promise.reject(error);
  },
);

export default client;
