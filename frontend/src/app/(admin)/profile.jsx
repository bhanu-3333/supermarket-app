import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function AdminProfile() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#123F7A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.storeHeader}>
        <Text style={styles.storeName}>{user?.storeName || 'My Store'}</Text>
        <View style={styles.badge}>
          <View style={styles.dot} />
          <Text style={styles.badgeText}>ADMIN</Text>
        </View>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Company name :</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.inputText}>{user?.storeName || 'N/A'}</Text>
        </View>

        <Text style={styles.label}>Owner Name :</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.inputText}>{user?.name || 'N/A'}</Text>
        </View>

        <Text style={styles.label}>Email :</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.inputText}>{user?.email || 'N/A'}</Text>
        </View>

        <Text style={styles.label}>Role :</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.inputText}>Admin</Text>
        </View>

        <Text style={styles.label}>Store Code :</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.inputText}>{user?.storeCode || 'N/A'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F7FA' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#111' },
  placeholder: { width: 40 },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  storeName: { fontSize: Math.min(width * 0.065, 26), fontWeight: 'bold', color: '#0A3B7C' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e', marginRight: 6 },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#333' },
  form: { paddingHorizontal: width * 0.05 },
  label: { fontSize: 14, fontWeight: '600', color: '#111', marginBottom: 8, marginLeft: 4 },
  inputContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 20,
  },
  inputText: { fontSize: 14, color: '#333' },
});
