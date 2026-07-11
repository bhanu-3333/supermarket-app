import { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Router ref — set by the app so AuthContext can navigate directly
  const routerRef = useRef(null);

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

  const login = async (userData) => {
    await AsyncStorage.setItem('smartcart_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    // 1. Clear ALL storage first
    try {
      await AsyncStorage.multiRemove([
        'smartcart_user',
        'token',
        'user',
        'role',
        'storeId',
        'cart',
      ]);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.localStorage.clear();
        window.sessionStorage.clear();
      }
    } catch (error) {
      console.error('[LOGOUT] Storage clear error:', error);
    }

    // 2. Clear state
    setUser(null);

    // 3. Dismiss all screens then replace with welcome screen
    if (routerRef.current) {
      try {
        routerRef.current.dismissAll();
      } catch (_) {}
      routerRef.current.replace('/');
    }
  };

  const setRouter = (router) => {
    routerRef.current = router;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setRouter }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
