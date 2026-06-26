import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Image, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';
import { wp, hp, moderateScale, isTablet } from '../../utils/responsive';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Missing Fields', 'Please fill in all fields');
      return;
    }
    if (!email.includes('@')) {
      toast.error('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    console.log('[LOGIN] Starting login for:', email);

    try {
      console.log('[LOGIN] Making API request to /auth/login');
      const { data } = await api.post('/auth/login', { email, password });
      console.log('[LOGIN] API response received:', data.success ? 'Success' : 'Failed');

      if (data.success) {
        console.log('[LOGIN] User role:', data.data.role);
        console.log('[LOGIN] Saving user data...');
        
        // Show success toast
        toast.success('Login Successful', 'Welcome back!');
        
        await login(data.data);
        console.log('[LOGIN] Redirecting to home...');
        
        // Navigate after short delay to show toast
        setTimeout(() => {
          router.replace('/');
        }, 1500);
      } else {
        console.log('[LOGIN] Login failed:', data.message);
        toast.error('Login Failed', data.message || 'Please check your credentials');
      }
    } catch (err) {
      console.error('[LOGIN] Login error:', err);
      if (err.response) {
        console.error('[LOGIN] Server responded with error:', err.response.status, err.response.data);
        
        if (err.response.status === 401) {
          toast.error('Invalid Email or Password', 'Please check your credentials and try again');
        } else {
          toast.error('Login Failed', err.response?.data?.message || 'Something went wrong');
        }
      } else if (err.request) {
        console.error('[LOGIN] No response from server. Check network connection.');
        console.error('[LOGIN] Request details:', err.request);
        toast.error('Server Error', 'Unable to connect to server. Please try again later');
      } else {
        console.error('[LOGIN] Request setup error:', err.message);
        toast.error('Network Error', 'Check your connection and try again');
      }
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
    top: -hp(8), 
    right: -wp(15), 
    width: wp(isTablet ? 30 : 50), 
    height: wp(isTablet ? 30 : 50), 
    opacity: 0.35 
  },
  bottomImage: { 
    position: 'absolute', 
    bottom: -hp(8), 
    left: -wp(15), 
    width: wp(isTablet ? 30 : 50), 
    height: wp(isTablet ? 30 : 50), 
    opacity: 0.35 
  },
  content: { 
    flex: 1, 
    paddingHorizontal: wp(8), 
    justifyContent: 'center',
    maxWidth: isTablet ? 500 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  brandTitle: { 
    fontSize: moderateScale(40), 
    fontWeight: 'bold', 
    color: '#0A3B7C', 
    textAlign: 'center', 
    marginBottom: hp(6) 
  },
  formContainer: { width: '100%', zIndex: 10 },
  label: { fontSize: moderateScale(14), fontWeight: '600', color: '#111', marginBottom: hp(1), marginLeft: wp(1) },
  input: { 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: moderateScale(25), 
    paddingHorizontal: wp(5), 
    paddingVertical: hp(1.8), 
    fontSize: moderateScale(14), 
    marginBottom: hp(2.5) 
  },
  loginButton: { 
    backgroundColor: '#123F7A', 
    borderRadius: moderateScale(25), 
    paddingVertical: hp(1.8), 
    alignItems: 'center', 
    marginTop: hp(1.2) 
  },
  loginButtonText: { color: '#fff', fontSize: moderateScale(16), fontWeight: '600' },
  forgotPasswordContainer: { alignItems: 'center', marginTop: hp(1.8) },
  forgotPasswordText: { color: '#123F7A', fontSize: moderateScale(14), fontWeight: '500' },
  createAccountContainer: { position: 'absolute', bottom: hp(5), alignSelf: 'center' },
  createAccountText: { color: '#123F7A', fontSize: moderateScale(12), fontWeight: '600', letterSpacing: 0.5 },
});
