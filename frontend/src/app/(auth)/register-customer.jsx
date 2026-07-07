import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';
import { wp, hp, moderateScale, isSmallDevice, isTablet } from '../../utils/responsive';

export default function RegisterCustomerScreen() {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [storeCode, setStoreCode] = useState('');
  const [storeVerified, setStoreVerified] = useState(null); // { name } or 'invalid'
  const [isLoading, setIsLoading] = useState(false);

  const verifyStoreCode = async (code) => {
    if (code.length < 5) { setStoreVerified(null); return; }
    try {
      const { data } = await api.post('/auth/verify-store', { storeCode: code });
      setStoreVerified(data.success ? { name: data.storeName } : 'invalid');
    } catch {
      setStoreVerified('invalid');
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !phone || !password || !storeCode) {
      toast.error('Missing Fields', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      toast.error('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      toast.error('Invalid Phone', 'Please enter a valid 10-digit phone number');
      return;
    }

    if (password.length < 8) {
      toast.error('Weak Password', 'Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await api.post('/auth/register-customer', {
        name,
        email,
        phone,
        password,
        storeCode,
      });

      if (data.success) {
        toast.success('Registration Successful', 'Welcome to SmartCart!');
        
        Alert.alert(
          'Welcome!',
          `You are now registered with ${data.data.storeName}!\n\nYou can now login and start shopping.`,
          [
            {
              text: 'OK',
              onPress: () => {
                setTimeout(() => {
                  router.push('/(auth)/login');
                }, 500);
              },
            },
          ]
        );
      } else {
        toast.error('Registration Failed', data.message || 'Unable to create account');
      }
    } catch (err) {
      if (err.response?.status === 400) {
        const message = err.response?.data?.message || '';
        if (message.includes('already exists')) {
          toast.error('Email Already Registered', 'Please use a different email address');
        } else if (message.includes('Invalid Store Code')) {
          toast.error('Invalid Store Code', 'Please enter a valid supermarket code');
        } else {
          toast.error('Registration Failed', message);
        }
      } else {
        toast.error('Server Error', 'Unable to connect to server');
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
      {/* Trolley Watermark Background */}
      <Image
        source={require('../../../assets/images/trolly.png')}
        style={styles.trolleyWatermark}
        resizeMode="contain"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.brandTitle}>SmartCart</Text>
        <Text style={styles.subtitle}>Join Supermarket</Text>

        <View style={styles.formContainer}>

          <Text style={styles.label}>Full Name :</Text>
          <TextInput
            style={styles.input}
            placeholder="eg : John Doe"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Email Id :</Text>
          <TextInput
            style={styles.input}
            placeholder="eg : john@gmail.com"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Phone Number :</Text>
          <TextInput
            style={styles.input}
            placeholder="eg : 9876543210"
            placeholderTextColor="#999"
            value={phone}
            onChangeText={setPhone}
            keyboardType="numeric"
            maxLength={10}
          />

          <Text style={styles.label}>Password :</Text>
          <TextInput
            style={styles.input}
            placeholder="Minimum 8 characters"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.label}>Store Code :</Text>
          <TextInput
            style={styles.input}
            placeholder="eg : FRE4821"
            placeholderTextColor="#999"
            value={storeCode}
            onChangeText={(text) => {
              const code = text.toUpperCase();
              setStoreCode(code);
              verifyStoreCode(code);
            }}
            autoCapitalize="characters"
          />
          {storeVerified === 'invalid' && (
            <Text style={{ color: 'red', marginTop: hp(-1.8), marginBottom: hp(1.2), marginLeft: wp(2), fontSize: moderateScale(10) }}>
              Invalid store code
            </Text>
          )}
          {storeVerified && storeVerified !== 'invalid' && (
            <Text style={{ color: '#10b981', marginTop: hp(-1.8), marginBottom: hp(1.2), marginLeft: wp(2), fontSize: moderateScale(10) }}>
              ✓ {storeVerified.name}
            </Text>
          )}

          <TouchableOpacity
            style={styles.signUpButton}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signUpButtonText}>Join Store</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.spacer} />

        <TouchableOpacity
          style={styles.loginLinkContainer}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.loginLinkText}>ALREADY HAVE AN ACCOUNT? LOGIN</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F7FA',
  },
  trolleyWatermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: wp(isSmallDevice ? 110 : 120),
    height: wp(isSmallDevice ? 110 : 120),
    marginTop: -(wp(isSmallDevice ? 110 : 120) / 2),
    marginLeft: -(wp(isSmallDevice ? 110 : 120) / 2),
    opacity: 0.15,
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: wp(8),
    justifyContent: 'center',
    paddingTop: hp(8),
    paddingBottom: hp(5),
    zIndex: 2,
    maxWidth: isTablet ? 500 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  brandTitle: {
    fontSize: moderateScale(isSmallDevice ? 32 : 40),
    fontWeight: 'bold',
    color: '#0A3B7C',
    textAlign: 'center',
    marginBottom: hp(1.2),
  },
  subtitle: {
    fontSize: moderateScale(isSmallDevice ? 16 : 18),
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: hp(3),
  },
  formContainer: {
    width: '100%',
    zIndex: 10,
  },
  label: {
    fontSize: moderateScale(isSmallDevice ? 12 : 14),
    fontWeight: '600',
    color: '#111',
    marginBottom: hp(1),
    marginLeft: wp(1),
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: moderateScale(25),
    paddingHorizontal: wp(5),
    paddingVertical: hp(isSmallDevice ? 1.5 : 1.8),
    fontSize: moderateScale(isSmallDevice ? 12 : 14),
    marginBottom: hp(2),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  signUpButton: {
    backgroundColor: '#123F7A',
    borderRadius: moderateScale(25),
    paddingVertical: hp(isSmallDevice ? 1.5 : 1.8),
    alignItems: 'center',
    marginTop: hp(1.2),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: moderateScale(isSmallDevice ? 14 : 16),
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    marginBottom: hp(1.2),
    textAlign: 'center',
    fontSize: moderateScale(isSmallDevice ? 12 : 14),
  },
  spacer: {
    flex: 1,
    minHeight: hp(2.5),
  },
  loginLinkContainer: {
    alignItems: 'center',
    paddingBottom: hp(2),
  },
  loginLinkText: {
    color: '#123F7A',
    fontSize: moderateScale(isSmallDevice ? 10 : 12),
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
