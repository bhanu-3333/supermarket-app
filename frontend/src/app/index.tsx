import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const handleLogin = (role: 'admin' | 'staff' | 'customer') => {
    // Dummy login logic based on role button pressed for demo purposes
    if (role === 'admin') router.push('/admin/dashboard');
    if (role === 'staff') router.push('/staff/dashboard');
    if (role === 'customer') router.push('/customer/dashboard');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: 20,
      backgroundColor: theme.background,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.primary,
      textAlign: 'center',
      marginBottom: 30,
    },
    input: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 8,
      padding: 15,
      marginBottom: 15,
      color: theme.text,
      fontSize: 16,
    },
    button: {
      backgroundColor: theme.primary,
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 15,
    },
    buttonText: {
      color: theme.textInverse,
      fontSize: 16,
      fontWeight: 'bold',
    },
    secondaryButton: {
      backgroundColor: theme.secondary,
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 15,
    },
    roleContainer: {
      marginTop: 20,
      paddingTop: 20,
      borderTopWidth: 1,
      borderColor: theme.border,
    },
    subtitle: {
      fontSize: 16,
      color: theme.text,
      textAlign: 'center',
      marginBottom: 15,
    }
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smart Supermarket</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={theme.text + '80'}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={theme.text + '80'}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={() => handleLogin('customer')}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <View style={styles.roleContainer}>
        <Text style={styles.subtitle}>Demo Quick Login:</Text>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => handleLogin('admin')}>
          <Text style={styles.buttonText}>Login as Admin</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => handleLogin('staff')}>
          <Text style={styles.buttonText}>Login as Staff</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
