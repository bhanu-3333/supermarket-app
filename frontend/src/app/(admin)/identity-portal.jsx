import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function IdentityPortal() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#123F7A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Identity & Access Portal</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.storeHeader}>
        <Text style={styles.storeName}>{user?.storeName || 'My Store'}</Text>
        <View style={styles.badge}>
          <View style={styles.dot} />
          <Text style={styles.badgeText}>ADMIN</Text>
        </View>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => router.push('/(admin)/staff-management')}
        >
          <View style={styles.optionLeft}>
            <View style={styles.iconCircle}>
              <Ionicons name="people" size={28} color="#123F7A" />
            </View>
            <View>
              <Text style={styles.optionTitle}>Staff</Text>
              <Text style={styles.optionDesc}>Set email and password for staff</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#888" />
        </TouchableOpacity>
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
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#111', flex: 1, textAlign: 'center' },
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
  content: { paddingHorizontal: width * 0.05 },
  optionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  optionLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTitle: { fontSize: 18, fontWeight: '600', color: '#111', marginBottom: 4 },
  optionDesc: { fontSize: 13, color: '#666' },
});
