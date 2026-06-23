import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('smartcart_user');
        if (stored) setUser(JSON.parse(stored));
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  const login = async (userData) => {
    await AsyncStorage.setItem('smartcart_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    try {
      // Clear all AsyncStorage items
      await AsyncStorage.multiRemove([
        'smartcart_user',
        'token',
        'user',
        'role',
        'storeId',
        'cart'
      ]);
      
      // Reset auth state
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
