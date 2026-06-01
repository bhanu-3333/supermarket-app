import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="account-type" />
      <Stack.Screen name="register-admin" />
      <Stack.Screen name="register-customer" />
    </Stack>
  );
}
