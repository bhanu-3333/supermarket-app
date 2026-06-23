import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import api from '../../utils/api';
import { wp, hp, moderateScale } from '../../utils/responsive';
import { useState } from 'react';

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const [creating, setCreating] = useState(false);

  const handleRedirectToOrder = async () => {
    if (creating) return;
    setCreating(true);

    try {
      const cart = JSON.parse(params.cart);
      const orderItems = cart.map((item) => ({
        product: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        weight: item.weight,
      }));

      const totalWeight = parseFloat(params.weight);
      const totalPrice = parseFloat(params.total);

      const { data } = await api.post(
        '/orders',
        {
          orderItems,
          totalWeight,
          taxPrice: 0,
          totalPrice,
          paymentMethod: 'UPI',
        },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );

      if (data.success) {
        router.replace({
          pathname: '/(customer)/order-summary',
          params: {
            orderId: data.data._id,
            cart: params.cart,
            total: params.total,
            weight: params.weight,
          },
        });
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to create order');
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.storeName}>{user?.storeName || 'Store'}</Text>
          <View style={styles.badge}>
            <View style={styles.dot} />
            <Text style={styles.badgeText}>CUSTOMER</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.successTitle}>Payment successful</Text>

          <View style={styles.iconContainer}>
            <View style={styles.successIcon}>
              <Ionicons name="card-outline" size={80} color="#111" />
              <View style={styles.checkmark}>
                <Ionicons name="checkmark" size={40} color="#10b981" />
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.redirectButton}
            onPress={handleRedirectToOrder}
            disabled={creating}
          >
            <Text style={styles.redirectButtonText}>
              {creating ? 'Creating Order...' : 'Redirect to Order page'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    padding: wp(5),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(4),
  },
  storeName: {
    fontSize: moderateScale(28),
    fontWeight: 'bold',
    color: '#0A3B7C',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F4FD',
    borderRadius: moderateScale(20),
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
  },
  dot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: '#10b981',
    marginRight: wp(1.5),
  },
  badgeText: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    color: '#0A3B7C',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: moderateScale(26),
    fontWeight: 'bold',
    color: '#111',
    marginBottom: hp(5),
  },
  iconContainer: {
    marginBottom: hp(8),
  },
  successIcon: {
    position: 'relative',
  },
  checkmark: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(25),
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  redirectButton: {
    backgroundColor: '#123F7A',
    borderRadius: moderateScale(25),
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(10),
    alignItems: 'center',
  },
  redirectButtonText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
});
