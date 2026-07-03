import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { wp, hp, moderateScale } from '../../utils/responsive';
import { useEffect, useRef } from 'react';

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const hasCreated = useRef(false);

  useEffect(() => {
    createOrder();
  }, []);

  const createOrder = async () => {
    if (hasCreated.current) return;
    hasCreated.current = true;
    try {
      const cart = JSON.parse(params.cart);
      const orderItems = cart.map((item) => ({
        product: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        weight: item.weight,
      }));
      await api.post(
        '/orders',
        {
          orderItems,
          totalWeight: parseFloat(params.weight),
          taxPrice: 0,
          totalPrice: parseFloat(params.total),
          paymentMethod: 'UPI',
        },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
    } catch (err) {
      console.error('Order creation error:', err);
    }
  };

  const handleGoToOrderPage = () => {
    router.replace({
      pathname: '/(customer)/order-summary',
      params: {
        cart: params.cart,
        total: params.total,
        weight: params.weight,
      },
    });
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

        {/* Centered content */}
        <View style={styles.content}>
          <Text style={styles.successTitle}>Payment successful</Text>

          <Image
            source={require('../../../assets/images/payment success.png')}
            style={styles.successImage}
            resizeMode="contain"
          />

          <TouchableOpacity style={styles.homeButton} onPress={handleGoToOrderPage}>
            <Text style={styles.homeButtonText}>Redirect to Order page</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: wp(5) },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  storeName: {
    fontSize: moderateScale(26),
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
    paddingHorizontal: wp(5),
  },
  successTitle: {
    fontSize: moderateScale(26),
    fontWeight: 'bold',
    color: '#111',
    marginBottom: hp(5),
    textAlign: 'center',
  },
  successImage: {
    width: wp(45),
    height: wp(45),
    marginBottom: hp(6),
  },
  homeButton: {
    backgroundColor: '#123F7A',
    borderRadius: moderateScale(30),
    paddingVertical: hp(1.8),
    alignItems: 'center',
    width: '100%',
  },
  homeButtonText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
});
