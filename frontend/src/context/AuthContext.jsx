import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('[AUTH] Checking authentication...');
      const stored = await AsyncStorage.getItem('smartcart_user');
      console.log('[AUTH] Stored user:', stored ? 'Found' : 'Not found');
      
      if (stored) {
        const userData = JSON.parse(stored);
        console.log('[AUTH] User data parsed:', userData.email, 'Role:', userData.role);
        
        // Validate token by making a test API call
        if (userData.token) {
          try {
            console.log('[AUTH] Validating token...');
            const response = await api.get('/auth/validate', {
              headers: { Authorization: `Bearer ${userData.token}` }
            });
            
            if (response.data.success) {
              console.log('[AUTH] Token valid, setting user');
              setUser(userData);
            } else {
              console.log('[AUTH] Token invalid, clearing storage');
              await clearAllStorage();
            }
          } catch (err) {
            console.log('[AUTH] Token validation failed, clearing storage');
            await clearAllStorage();
          }
        } else {
          console.log('[AUTH] No token found, clearing storage');
          await clearAllStorage();
        }
      } else {
        console.log('[AUTH] No stored user');
      }
    } catch (error) {
      console.error('[AUTH] Check auth error:', error);
      await clearAllStorage();
    } finally {
      setLoading(false);
      console.log('[AUTH] Auth check complete');
    }
  };

  const clearAllStorage = async () => {
    try {
      console.log('[AUTH] Clearing all storage...');
      
      // Clear AsyncStorage
      const keys = await AsyncStorage.getAllKeys();
      console.log('[AUTH] AsyncStorage keys to clear:', keys);
      await AsyncStorage.multiRemove(keys);
      
      // Clear web storage if running on web
      if (Platform.OS === 'web') {
        console.log('[AUTH] Clearing web storage...');
        if (typeof window !== 'undefined') {
          window.localStorage.clear();
          window.sessionStorage.clear();
        }
      }
      
      setUser(null);
      console.log('[AUTH] All storage cleared');
    } catch (error) {
      console.error('[AUTH] Clear storage error:', error);
    }
  };

  const login = async (userData) => {
    console.log('[AUTH] Logging in user:', userData.email, 'Role:', userData.role);
    await AsyncStorage.setItem('smartcart_user', JSON.stringify(userData));
    setUser(userData);
    console.log('[AUTH] Login complete');
  };

  const logout = async () => {
    try {
      console.log('[AUTH] Logging out...');
      console.log('[AUTH] User before logout:', user?.email, 'Role:', user?.role);
      console.log('[AUTH] Token before logout:', user?.token ? 'exists' : 'null');
      
      // Clear user state first
      setUser(null);
      
      // Then clear storage
      await clearAllStorage();
      
      console.log('[AUTH] User after logout:', null);
      console.log('[AUTH] Token after logout:', null);
      console.log('[AUTH] Logout complete - user state cleared');
      
      return true;
    } catch (error) {
      console.error('[AUTH] Logout error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
