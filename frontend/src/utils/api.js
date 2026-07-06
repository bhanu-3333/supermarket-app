import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Automatically detect the correct API URL based on environment
const getApiUrl = () => {
  // For web browser
  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api';
  }
  
  // For Expo Go on mobile device
  // Get the IP address from Expo's manifest
  const debuggerHost = Constants.expoConfig?.hostUri?.split(':').shift();
  
  if (debuggerHost) {
    const apiUrl = `http://${debuggerHost}:5000/api`;
    console.log('[API] Using API URL:', apiUrl);
    return apiUrl;
  }
  
  // Fallback to localhost (for emulator/simulator)
  console.log('[API] Using fallback localhost');
  return 'http://localhost:5000/api';
};

const baseURL = getApiUrl();

console.log('[API] Initializing axios with baseURL:', baseURL);

const api = axios.create({
  baseURL,
  timeout: 10000,
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
      } catch (_) {}
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
      });
    } else {
      // Request setup error
      console.error('[API] Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
