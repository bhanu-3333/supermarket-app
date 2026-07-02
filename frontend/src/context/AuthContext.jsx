import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const stored = await AsyncStorage.getItem('smartcart_user');
      if (stored) {
        const userData = JSON.parse(stored);
        if (userData?.token) {
          setUser(userData);
        }
      }
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  const clearAllStorage = async () => {
    try {
      // Clear specific keys only - much faster than getAllKeys
      const keysToRemove = [
        'smartcart_user',
        'token',
        'user',
        'role',
        'storeId',
        'cart'
      ];
      
      AsyncStorage.multiRemove(keysToRemove); // Don't await - fire and forget
      
      // Clear web storage if running on web
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.localStorage.clear();
        window.sessionStorage.clear();
      }
      
      setUser(null);
    } catch (error) {
      console.error('[AUTH] Clear storage error:', error);
    }
  };

  const login = async (userData) => {
    await AsyncStorage.setItem('smartcart_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    try {
      // Clear user state immediately for instant UI update
      setUser(null);
      
      // Clear storage in background (don't await)
      clearAllStorage();
      
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
