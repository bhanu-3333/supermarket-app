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
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../utils/api';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');
    
    if (!companyName || !ownerName || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Attempting registration...');
      console.log('API URL:', 'http://10.67.83.219:5000/api/auth/register-admin');
      
      const { data } = await api.post('/auth/register-admin', {
        storeName: companyName,
        ownerName,
        email,
        password,
      });

      console.log('Registration response:', data);

      if (data.success) {
        Alert.alert(
          'Success!',
          `Account created successfully!\n\nStore Code: ${data.data.storeCode}\n\nYou can now login with your credentials.`,
          [
            {
              text: 'OK',
              onPress: () => router.push('/(auth)/login'),
            },
          ]
        );
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      console.error('Error details:', err.response?.data);
      const errorMsg = err.response?.data?.message || 'Network error. Please check your connection.';
      setError(errorMsg);
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

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.brandTitle}>SmartCart</Text>

        <View style={styles.formContainer}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
          <TextInput 
            style={styles.input}
            placeholder="eg : 28398492"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: width * 0.08,
    justifyContent: 'center',
    paddingTop: height * 0.08,
    paddingBottom: 40,
  },
  brandTitle: {
    fontSize: Math.min(width * 0.1, 40),
    fontWeight: 'bold',
    color: '#0A3B7C',
    textAlign: 'center',
    marginBottom: height * 0.04,
  },
  formContainer: {
    width: '100%',
    zIndex: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 14,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  signUpButton: {
    backgroundColor: '#123F7A',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 14,
  },
  spacer: {
    flex: 1,
    minHeight: 40,
  },
  loginLinkContainer: {
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#123F7A',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
