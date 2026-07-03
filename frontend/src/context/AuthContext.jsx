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


  const login = async (userData) => {
    await AsyncStorage.setItem('smartcart_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    // Synchronous state clear — UI updates instantly
    setUser(null);
    // Clear storage in background — don't block navigation
    AsyncStorage.multiRemove(['smartcart_user', 'token', 'user', 'role', 'storeId', 'cart']);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.localStorage.clear();
      window.sessionStorage.clear();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
