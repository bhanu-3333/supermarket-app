import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { useEffect } from 'react';

// This component watches auth state and enforces routing rules
function AuthGuard() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAdminGroup = segments[0] === '(admin)';
    const inStaffGroup = segments[0] === '(staff)';
    const inCustomerGroup = segments[0] === '(customer)';
    const inProtectedRoute = inAdminGroup || inStaffGroup || inCustomerGroup;

    if (!user && inProtectedRoute) {
      // Not authenticated but trying to access a protected route — go to Get Started
      router.replace('/');
    }
  }, [user, loading, segments]);

  return null;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AuthGuard />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(admin)" />
          <Stack.Screen name="(staff)" />
          <Stack.Screen name="(customer)" />
        </Stack>
      </ToastProvider>
    </AuthProvider>
  );
}
