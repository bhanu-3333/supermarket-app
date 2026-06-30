import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { wp, hp, moderateScale, isTablet } from '../../utils/responsive';
import { useState } from 'react';
import LogoutModal from '../../components/LogoutModal';

export default function CustomerProfile() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    try {
      console.log('[CUSTOMER LOGOUT] Starting logout...');
      const success = await logout();
      console.log('[CUSTOMER LOGOUT] Logout result:', success);
      setShowLogoutModal(false);
      
      // Add small delay to ensure state updates
      setTimeout(() => {
        console.log('[CUSTOMER LOGOUT] Navigating to root...');
        router.replace('/');
      }, 100);
    } catch (error) {
      console.error('[CUSTOMER LOGOUT] Logout error:', error);
    }
  };

  const menuItems = [
    {
      icon: 'person-outline',
      title: 'Profile',
      subtitle: 'View your profile here',
      onPress: () => {},
    },
    {
      icon: 'receipt-outline',
      title: 'Order History',
      subtitle: 'View your past orders',
      onPress: () => router.push('/(customer)/orders'),
    },
    {
      icon: 'heart-outline',
      title: 'Rate my app',
      subtitle: "We'd love to hear your thoughts",
      onPress: () => {},
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      subtitle: 'Need help?',
      onPress: () => {},
    },
    {
      icon: 'information-circle-outline',
      title: 'About App',
      subtitle: 'Want to know about the app',
      onPress: () => {},
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.storeName}>{user?.storeName || 'SmartCart'}</Text>
          <View style={styles.badge}>
            <View style={styles.dot} />
            <Text style={styles.badgeText}>CUSTOMER</Text>
          </View>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color="#123F7A" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'Customer'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'customer@email.com'}</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuLeft}>
                <View style={styles.iconCircle}>
                  <Ionicons name={item.icon} size={24} color="#123F7A" />
                </View>
                <View style={styles.menuText}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={() => setShowLogoutModal(true)}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
        
        {/* Bottom Spacer for Navigation */}
        <View style={styles.bottomSpacer} />
      </View>

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
  content: {
    flex: 1,
    padding: wp(5),
    maxWidth: isTablet ? 600 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp(2.5),
    marginBottom: hp(3),
  },
  storeName: {
    fontSize: moderateScale(26),
    fontWeight: 'bold',
    color: '#0A3B7C',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
    borderRadius: moderateScale(20),
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.7),
  },
  dot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: '#10b981',
    marginRight: wp(1.5),
  },
  badgeText: { fontSize: moderateScale(12), fontWeight: '600', color: '#333' },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: moderateScale(12),
    padding: wp(4),
    marginBottom: hp(3),
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
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
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#111',
    marginBottom: hp(0.5),
  },
  profileEmail: {
    fontSize: moderateScale(14),
    color: '#666',
  },
  menuContainer: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: moderateScale(12),
    padding: wp(4),
    marginBottom: hp(1.5),
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#111',
    marginBottom: hp(0.3),
  },
  menuSubtitle: {
    fontSize: moderateScale(13),
    color: '#888',
  },
  logoutButton: {
    backgroundColor: '#123F7A',
    borderRadius: moderateScale(25),
    paddingVertical: hp(1.8),
    alignItems: 'center',
    marginTop: hp(2),
    marginBottom: hp(3),
  },
  logoutText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  bottomSpacer: {
    height: hp(12),
  },
});
