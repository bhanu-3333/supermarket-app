import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function AdminMore() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  const MenuItem = ({ iconImage, title, onPress, color = '#111' }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuLeft}>
        <View style={[styles.iconCircle, { backgroundColor: color === '#ef4444' ? '#FFE8E8' : '#E8F4FD' }]}>
          <Image
            source={iconImage}
            style={{ width: 24, height: 24, tintColor: color === '#ef4444' ? '#ef4444' : '#123F7A' }}
            resizeMode="contain"
          />
        </View>
        <Text style={[styles.menuTitle, { color }]}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#888" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Logs</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Image
            source={require('../../../assets/images/person .png')}
            style={{ width: 32, height: 32, tintColor: '#123F7A' }}
            resizeMode="contain"
          />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name || 'Admin'}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'admin@store.com'}</Text>
          <View style={styles.badge}>
            <View style={styles.dot} />
            <Text style={styles.badgeText}>ADMIN</Text>
          </View>
        </View>
      </View>

      <View style={styles.menuSection}>
        <MenuItem
          iconImage={require('../../../assets/images/person .png')}
          title="Profile"
          onPress={() => router.push('/(admin)/profile')}
        />
        <MenuItem
          iconImage={require('../../../assets/images/key.png')}
          title="Identity & Access Portal"
          onPress={() => router.push('/(admin)/identity-portal')}
        />
        <MenuItem
          iconImage={require('../../../assets/images/favorite.png')}
          title="Rate my app"
          onPress={() => {}}
        />
        <MenuItem
          iconImage={require('../../../assets/images/help.png')}
          title="Help & Support"
          onPress={() => {}}
        />
        <MenuItem
          iconImage={require('../../../assets/images/info .png')}
          title="About App"
          onPress={() => {}}
        />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F7FA' },
  header: {
    paddingHorizontal: width * 0.05,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111' },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: width * 0.05,
    marginTop: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  profileEmail: { fontSize: 14, color: '#666', marginBottom: 8 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e', marginRight: 6 },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#333' },
  menuSection: {
    backgroundColor: '#fff',
    marginHorizontal: width * 0.05,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: { fontSize: 16, fontWeight: '500', color: '#111' },
  logoutButton: {
    backgroundColor: '#123F7A',
    marginHorizontal: width * 0.05,
    marginTop: 20,
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
