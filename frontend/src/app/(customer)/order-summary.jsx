import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { wp, hp, moderateScale } from '../../utils/responsive';

export default function OrderSummaryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const cart = JSON.parse(params.cart);
  const total = parseFloat(params.total);
  const weight = parseFloat(params.weight);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.storeName}>{user?.storeName || 'Store'}</Text>
          <View style={styles.badge}>
            <View style={styles.dot} />
            <Text style={styles.badgeText}>CUSTOMER</Text>
          </View>
        </View>

        <Text style={styles.pageTitle}>Your Product</Text>

        {/* Product List */}
        {cart.map((item) => (
          <View key={item._id} style={styles.productCard}>
            <View style={styles.productLeft}>
              <Text style={styles.productName}>
                {item.name} {item.weight}{item.weightUnit}
              </Text>
              <View style={styles.barcodeRow}>
                <Ionicons name="barcode-outline" size={14} color="#666" />
                <Text style={styles.barcode}>{item.barcode}</Text>
              </View>
            </View>
            <View style={styles.productRight}>
              <Text style={styles.productPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
              <Text style={styles.productUnits}>{item.quantity} Units</Text>
            </View>
          </View>
        ))}

        {/* Total Section */}
        <View style={styles.totalCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Net Weight</Text>
            <Text style={styles.summaryValue}>{weight.toFixed(2)} L</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Grand total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => router.replace('/(customer)')}
          >
            <Text style={styles.homeButtonText}>Redirect to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  },
  content: {
    padding: wp(5),
    paddingBottom: hp(12),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2.5),
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
  pageTitle: {
    fontSize: moderateScale(22),
    fontWeight: 'bold',
    color: '#111',
    marginBottom: hp(2),
  },
  productCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: moderateScale(12),
    padding: wp(4),
    marginBottom: hp(1.5),
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  productLeft: {
    flex: 1,
  },
  productName: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#111',
    marginBottom: hp(0.5),
  },
  barcodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
  },
  barcode: {
    fontSize: moderateScale(12),
    color: '#666',
  },
  productRight: {
    alignItems: 'flex-end',
  },
  productPrice: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#111',
    marginBottom: hp(0.5),
  },
  productUnits: {
    fontSize: moderateScale(12),
    color: '#666',
  },
  totalCard: {
    backgroundColor: '#D6E8FF',
    borderRadius: moderateScale(16),
    padding: wp(5),
    marginTop: hp(2),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(1.5),
  },
  summaryLabel: {
    fontSize: moderateScale(14),
    color: '#111',
  },
  summaryValue: {
    fontSize: moderateScale(14),
    color: '#111',
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(2),
  },
  totalLabel: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#111',
  },
  totalValue: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#111',
  },
  homeButton: {
    backgroundColor: '#123F7A',
    borderRadius: moderateScale(25),
    paddingVertical: hp(1.8),
    alignItems: 'center',
  },
  homeButtonText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
});
