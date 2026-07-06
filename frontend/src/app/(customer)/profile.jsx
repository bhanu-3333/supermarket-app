import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { wp, hp, moderateScale, isTablet } from '../../utils/responsive';
import { useState } from 'react';
import LogoutModal from '../../components/LogoutModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../utils/api';

export default function CustomerProfile() {
  const router = useRouter();
  const { user, logout, login } = useAuth();
  const insets = useSafeAreaInsets();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingPhone, setSavingPhone] = useState(false);

  const handleSavePhone = async () => {
    if (!/^[0-9]{10}$/.test(phone)) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number');
      return;
    }
    setSavingPhone(true);
    try {
      const { data } = await api.patch('/customer/update-phone', { phone });
      if (data.success) {
        await login({ ...user, phone });
        setEditingPhone(false);
        Alert.alert('Saved', 'Phone number updated successfully');
      }
    } catch {
      Alert.alert('Error', 'Failed to update phone number');
    } finally {
      setSavingPhone(false);
    }
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    // AuthGuard in _layout.jsx will automatically redirect to Get Started
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
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + hp(1.5) }]}
        showsVerticalScrollIndicator={false}
      >
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
            {/* Phone number row */}
            {editingPhone ? (
              <View style={styles.phoneEditRow}>
                <TextInput
                  style={styles.phoneInput}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="numeric"
                  maxLength={10}
                  placeholder="10-digit phone"
                  placeholderTextColor="#aaa"
                />
                <TouchableOpacity onPress={handleSavePhone} disabled={savingPhone} style={styles.saveBtn}>
                  {savingPhone
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={styles.saveBtnText}>Save</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setEditingPhone(false)} style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.phoneRow} onPress={() => setEditingPhone(true)}>
                <Ionicons name="call-outline" size={14} color="#666" />
                <Text style={styles.profilePhone}>
                  {user?.phone ? user.phone : 'Add phone number'}
                </Text>
                <Ionicons name="pencil-outline" size={13} color="#123F7A" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            )}
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
      </ScrollView>

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
  scroll: { flex: 1 },
  content: {
    padding: wp(5),
    paddingBottom: hp(12),
    maxWidth: isTablet ? 600 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(0.5),
    gap: 4,
  },
  profilePhone: {
    fontSize: moderateScale(13),
    color: '#666',
    marginLeft: 2,
  },
  phoneEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(0.8),
    gap: wp(2),
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: moderateScale(8),
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.7),
    fontSize: moderateScale(13),
    color: '#111',
    backgroundColor: '#f9f9f9',
  },
  saveBtn: {
    backgroundColor: '#123F7A',
    borderRadius: moderateScale(8),
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
  },
  saveBtnText: {
    color: '#fff',
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  cancelBtn: {
    paddingHorizontal: wp(2),
  },
  cancelBtnText: {
    color: '#888',
    fontSize: moderateScale(12),
  },
  menuContainer: {
    // no flex:1 — let it size naturally so logout button flows below
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
  },
  logoutText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
});
