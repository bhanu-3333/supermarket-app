import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Image, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { wp, hp, moderateScale, isTablet } from '../../utils/responsive';

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
        // After login, redirect to root and let AuthContext handle the routing
        router.replace('/');
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
  errorText: { color: 'red', marginBottom: hp(1.2), textAlign: 'center', fontSize: moderateScale(14) },
});
