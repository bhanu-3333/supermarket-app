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
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const router = useRouter();
  const toast = useToast();
  const [companyName, setCompanyName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!companyName || !ownerName || !email || !password) {
      toast.error('Missing Fields', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      toast.error('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      toast.error('Weak Password', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Attempting registration...');
      
      const { data } = await api.post('/auth/register-admin', {
        storeName: companyName,
        ownerName,
        email,
        password,
      });

      console.log('Registration response:', data);

      if (data.success) {
        toast.success('Account Created Successfully', 'Your supermarket account has been created');
        
        Alert.alert(
          'Registration Successful!',
          `Store Code: ${data.data.storeCode}\n\nPlease save this code. Your staff and customers will need it to register.`,
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
      console.error('Registration error:', err);
      console.error('Error details:', err.response?.data);
      
      if (err.response?.status === 400 && err.response?.data?.message?.includes('already exists')) {
        toast.error('Email Already Registered', 'Please use a different email address');
      } else {
        toast.error('Server Error', err.response?.data?.message || 'Unable to connect to server');
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
        pointerEvents="none"
      />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.brandTitle}>SmartCart</Text>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Company name :</Text>
          <TextInput 
            style={styles.input}
            placeholder="eg : Rubama supermarket"
            placeholderTextColor="#999"
            value={companyName}
            onChangeText={setCompanyName}
          />

          <Text style={styles.label}>Owner Name :</Text>
          <TextInput 
            style={styles.input}
            placeholder="eg : Murali"
            placeholderTextColor="#999"
            value={ownerName}
            onChangeText={setOwnerName}
          />
          
          <Text style={styles.label}>Email Id :</Text>
          <TextInput 
            style={styles.input}
            placeholder="eg : rubamasupermarket@gmail.com"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password :</Text>
          <View style={styles.passwordContainer}>
            <TextInput 
              style={styles.passwordInput}
              placeholder="eg : 28398492"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#888" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.signUpButton} 
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signUpButtonText}>Sign Up</Text>
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
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: wp(8),
    justifyContent: 'center',
    paddingTop: hp(8),
    paddingBottom: hp(5),
    maxWidth: isTablet ? 500 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  brandTitle: {
    fontSize: moderateScale(isSmallDevice ? 32 : 40),
    fontWeight: 'bold',
    color: '#0A3B7C',
    textAlign: 'center',
    marginBottom: hp(4),
  },
  formContainer: {
    width: '100%',
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: moderateScale(25),
    marginBottom: hp(2),
    paddingHorizontal: wp(5),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: hp(isSmallDevice ? 1.5 : 1.8),
    fontSize: moderateScale(isSmallDevice ? 12 : 14),
    color: '#111',
  },
  eyeIcon: {
    padding: wp(2),
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
  spacer: {
    flex: 1,
    minHeight: hp(5),
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
