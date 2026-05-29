import { Stack } from 'expo-router';
import { Colors } from '../constants/theme';
import { useColorScheme } from 'react-native';

export default function Layout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.primary,
        },
        headerTintColor: theme.textInverse,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: theme.background,
        }
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Login - Smart Supermarket' }} />
      <Stack.Screen name="admin/dashboard" options={{ title: 'Admin Dashboard' }} />
      <Stack.Screen name="staff/dashboard" options={{ title: 'Staff Dashboard' }} />
      <Stack.Screen name="customer/dashboard" options={{ title: 'Customer Home' }} />
    </Stack>
  );
}
