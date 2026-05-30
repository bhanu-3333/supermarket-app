import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Image, KeyboardAvoidingView, Platform, ActivityIndicator, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    if (!email.includes('@')) { setError('Please enter a valid email'); return; }

    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.success) {
        await login(data.data);
        const role = data.data.role;
        if (role === 'admin') router.replace('/(admin)/index');
        else if (role === 'staff') router.replace('/(staff)/index');
        else router.replace('/(customer)/index');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Network error. Check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Image
        source={require('../../../assets/images/top.png')}
        style={styles.topImage}
        resizeMode="contain"
      />
      <Image
        source={require('../../../assets/images/bottom.png')}
        style={styles.bottomImage}
        resizeMode="contain"
      />
      <View style={styles.content}>
        <Text style={styles.brandTitle}>SmartCart</Text>
        <View style={styles.formContainer}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Text style={styles.label}>Email Id :</Text>
          <TextInput
            style={styles.input}
            placeholder="eg : store@gmail.com"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Text style={styles.label}>Password :</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
            {isLoading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.loginButtonText}>Login</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPasswordText}>Forget password?</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.createAccountContainer}
          onPress={() => router.push('/(auth)/account-type')}
        >
          <Text style={styles.createAccountText}>CREATE NEW ACCOUNT? SIGN UP</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F7FA' },
  topImage: { 
    position: 'absolute', 
    top: -60, 
    right: -60, 
    width: width * 0.5, 
    height: width * 0.5, 
    opacity: 0.35 
  },
  bottomImage: { 
    position: 'absolute', 
    bottom: -60, 
    left: -60, 
    width: width * 0.5, 
    height: width * 0.5, 
    opacity: 0.35 
  },
  content: { flex: 1, paddingHorizontal: width * 0.08, justifyContent: 'center' },
  brandTitle: { 
    fontSize: Math.min(width * 0.1, 40), 
    fontWeight: 'bold', 
    color: '#0A3B7C', 
    textAlign: 'center', 
    marginBottom: height * 0.06 
  },
  formContainer: { width: '100%', zIndex: 10 },
  label: { fontSize: 14, fontWeight: '600', color: '#111', marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 15, fontSize: 14, marginBottom: 20, elevation: 2 },
  loginButton: { backgroundColor: '#123F7A', borderRadius: 25, paddingVertical: 15, alignItems: 'center', marginTop: 10, elevation: 3 },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  forgotPasswordContainer: { alignItems: 'center', marginTop: 15 },
  forgotPasswordText: { color: '#123F7A', fontSize: 14, fontWeight: '500' },
  createAccountContainer: { position: 'absolute', bottom: 40, alignSelf: 'center' },
  createAccountText: { color: '#123F7A', fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  errorText: { color: 'red', marginBottom: 10, textAlign: 'center', fontSize: 14 },
});
