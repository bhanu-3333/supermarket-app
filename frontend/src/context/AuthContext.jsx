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
    console.log('[LOGOUT] Step 1: Starting logout...');
    console.log('[LOGOUT] Step 2: User before logout:', user?.email, '| role:', user?.role);

    // 1. Clear state immediately
    setUser(null);
    console.log('[LOGOUT] Step 3: User state set to null');

    // 2. Clear ALL storage
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

      // Verify it's gone
      const check = await AsyncStorage.getItem('smartcart_user');
      console.log('[LOGOUT] Step 4: Storage cleared. Verification:', check === null ? 'CONFIRMED NULL' : 'STILL EXISTS!');
    } catch (error) {
      console.error('[LOGOUT] Storage clear error:', error);
    }

    // 3. Navigate to Get Started — use the router ref if available
    console.log('[LOGOUT] Step 5: Navigating to Get Started...');
    if (routerRef.current) {
      routerRef.current.replace('/');
      console.log('[LOGOUT] Step 6: Navigation dispatched via routerRef');
    } else {
      console.warn('[LOGOUT] Step 6: routerRef not set — AuthGuard will handle navigation');
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
