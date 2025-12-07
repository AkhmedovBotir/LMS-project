import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Android uchun localhost IP manzili
const LOCAL_IP = '192.168.100.159'; // Real qurilma uchun

export const api = axios.create({
  baseURL: `http://10.93.4.21:5000/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 sekund timeout
});

// Add request interceptor to add auth token
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    console.log('Current token:', token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('Token not found in AsyncStorage');
    }
  } catch (error) {
    console.error('Error getting token:', error);
  }
  return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      console.error('Network Error:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      });
      
      // Retry logic
      if (error.config && !error.config._retry) {
        error.config._retry = true;
        try {
          return await api(error.config);
        } catch (retryError) {
          console.error('Retry failed:', retryError);
          return Promise.reject(retryError);
        }
      }
    }

    if (error.response?.status === 401) {
      // Token expired or invalid
      try {
        await AsyncStorage.removeItem('token');
        // Redirect to login page or handle token refresh here
      } catch (e) {
        console.error('Error removing token:', e);
      }
    }

    return Promise.reject(error);
  }
); 