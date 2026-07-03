import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { wp, hp, moderateScale, isTablet } from '../../utils/responsive';
import { useState } from 'react';
import LogoutModal from '../../components/LogoutModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdminMore() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(false);
    router.replace('/');
    logout();
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
      <View style={[styles.header, { paddingTop: insets.top + hp(1.5) }]}>
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

      <TouchableOpacity style={styles.logoutButton} onPress={() => setShowLogoutModal(true)}>
        <Text style={styles.logoutButtonText}>Log out</Text>
      </TouchableOpacity>

      <LogoutModal
        visible={showLogoutModal}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F7FA' },
  header: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(2.5),
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: moderateScale(24), fontWeight: 'bold', color: '#111' },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: wp(5),
    marginTop: hp(2.5),
    marginBottom: hp(2.5),
    padding: wp(5),
    borderRadius: moderateScale(12),
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    maxWidth: isTablet ? 600 : '90%',
    alignSelf: 'center',
    width: '90%',
  },
  avatar: {
    width: moderateScale(64),
    height: moderateScale(64),
    borderRadius: moderateScale(32),
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(4),
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: moderateScale(18), fontWeight: 'bold', color: '#111', marginBottom: hp(0.5) },
  profileEmail: { fontSize: moderateScale(14), color: '#666', marginBottom: hp(1) },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
    borderRadius: moderateScale(20),
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    alignSelf: 'flex-start',
  },
  dot: { width: moderateScale(8), height: moderateScale(8), borderRadius: moderateScale(4), backgroundColor: '#22c55e', marginRight: wp(1.5) },
  badgeText: { fontSize: moderateScale(11), fontWeight: '600', color: '#333' },
  menuSection: {
    backgroundColor: '#fff',
    marginHorizontal: wp(5),
    borderRadius: moderateScale(12),
    overflow: 'hidden',
    maxWidth: isTablet ? 600 : '90%',
    alignSelf: 'center',
    width: '90%',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: wp(3) },
  iconCircle: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: { fontSize: moderateScale(16), fontWeight: '500', color: '#111' },
  logoutButton: {
    backgroundColor: '#123F7A',
    marginHorizontal: wp(5),
    marginTop: hp(2.5),
    borderRadius: moderateScale(25),
    paddingVertical: hp(1.8),
    alignItems: 'center',
    maxWidth: isTablet ? 600 : '90%',
    alignSelf: 'center',
    width: '90%',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
});
