import { Platform } from 'react-native';
import Constants from 'expo-constants';
import api from './api';

/**
 * Test network connectivity to the backend server
 * Useful for debugging Expo Go connection issues
 */
export const testBackendConnection = async () => {
  console.log('\n========== NETWORK TEST ==========');
  console.log('Platform:', Platform.OS);
  console.log('Environment:', __DEV__ ? 'Development' : 'Production');
  
  // Get the detected IP
  const debuggerHost = Constants.expoConfig?.hostUri?.split(':').shift();
  console.log('Detected IP:', debuggerHost || 'None');
  
  try {
    console.log('Testing backend connection...');
    const response = await api.get('/health');
    console.log('✓ Backend is reachable');
    console.log('Response:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('✗ Backend connection failed');
    
    if (error.response) {
      console.error('Server error:', error.response.status, error.response.data);
      return { 
        success: false, 
        error: 'Server error', 
        details: error.response.data 
      };
    } else if (error.request) {
      console.error('No response from server');
      console.error('This usually means:');
      console.error('1. Backend is not running');
      console.error('2. Wrong IP address');
      console.error('3. Firewall blocking connection');
      console.error('4. Not on same WiFi network');
      return { 
        success: false, 
        error: 'Cannot reach server', 
        details: 'No response received' 
      };
    } else {
      console.error('Request error:', error.message);
      return { 
        success: false, 
        error: 'Network error', 
        details: error.message 
      };
    }
  } finally {
    console.log('==================================\n');
  }
};

/**
 * Get current API configuration info
 */
export const getApiInfo = () => {
  const debuggerHost = Constants.expoConfig?.hostUri?.split(':').shift();
  const apiUrl = Platform.OS === 'web' 
    ? 'http://localhost:5000/api'
    : debuggerHost 
      ? `http://${debuggerHost}:5000/api`
      : 'http://localhost:5000/api';
  
  return {
    platform: Platform.OS,
    apiUrl,
    detectedIP: debuggerHost || 'None',
    isDevelopment: __DEV__,
  };
};
