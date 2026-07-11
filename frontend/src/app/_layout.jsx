import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { useEffect } from 'react';

// Registers the router into AuthContext so logout() can navigate directly
function RouterRegistrar() {
  const { setRouter } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setRouter(router);
  }, [router]);

  return null;
}

// Backup guard — catches any case where user becomes null on a protected screen
function AuthGuard() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inProtectedRoute =
      segments[0] === '(admin)' ||
      segments[0] === '(staff)' ||
      segments[0] === '(customer)';

    if (!user && inProtectedRoute) {
      setTimeout(() => {
        try { router.dismissAll(); } catch (_) {}
        router.replace('/');
      }, 0);
    }
  }, [user, loading, segments]);

  return null;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ToastProvider>
        <RouterRegistrar />
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
