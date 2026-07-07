import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration for different environments
const getApiUrl = () => {
  // For production APK, use your actual server IP
  const PRODUCTION_API_URL = 'https://smartcart-backend.up.railway.app/api'; // Replace with your actual Railway URL
  
  // For development
  if (__DEV__) {
    // For web browser in development
    if (Platform.OS === 'web') {
      return 'http://localhost:5000/api';
    }
    
    // For mobile device in development (Expo Go)
    const debuggerHost = Constants.expoConfig?.hostUri?.split(':').shift();
    if (debuggerHost) {
      const apiUrl = `http://${debuggerHost}:5000/api`;
      console.log('[API] Development - Using API URL:', apiUrl);
      return apiUrl;
    }
    
    // Fallback for emulator/simulator
    return Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';
  }
  
  // For production builds
  console.log('[API] Production - Using API URL:', PRODUCTION_API_URL);
  return PRODUCTION_API_URL;
};

const baseURL = getApiUrl();

console.log('[API] Initializing axios with baseURL:', baseURL);

const api = axios.create({
  baseURL,
  timeout: 15000, // Increased timeout for production
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — auto-attach token from storage
api.interceptors.request.use(
  async (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    // Only attach token if not already set
    if (!config.headers.Authorization) {
      try {
        const stored = await AsyncStorage.getItem('smartcart_user');
        if (stored) {
          const userData = JSON.parse(stored);
          if (userData?.token) {
            config.headers.Authorization = `Bearer ${userData.token}`;
          }
        }
      } catch (error) {
        console.log('[API] Error reading token from storage:', error);
      }
    }
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`[API] Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('[API] Response error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
    } else if (error.request) {
      // Request made but no response
      console.error('[API] No response received:', {
        url: error.config?.url,
        message: error.message,
        code: error.code,
      });
    } else {
      // Request setup error
      console.error('[API] Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
