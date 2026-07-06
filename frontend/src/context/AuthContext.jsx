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

  const logout = async () => {
    console.log('AuthContext: Starting logout process...');
    
    // Clear state immediately for instant UI update
    setUser(null);
    console.log('AuthContext: User state cleared');
    
    // Clear all storage
    try {
      await AsyncStorage.multiRemove([
        'smartcart_user', 
        'token', 
        'user', 
        'role', 
        'storeId', 
        'cart'
      ]);
      
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.localStorage.clear();
        window.sessionStorage.clear();
      }
      
      console.log('AuthContext: Storage cleared successfully');
    } catch (error) {
      console.error('Error clearing storage during logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
