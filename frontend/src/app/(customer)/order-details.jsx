import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import api from '../../utils/api';
import { wp, hp, moderateScale } from '../../utils/responsive';

export default function OrderDetailsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  const fetchOrderDetails = async () => {
    try {
      const { data } = await api.get(`/orders/${params.orderId}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      if (data.success) {
        setOrder(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch order details:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#123F7A" />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={80} color="#ef4444" />
          <Text style={styles.errorText}>Order not found</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Order Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order ID</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {order._id}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>{formatDate(order.createdAt)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Time</Text>
            <Text style={styles.infoValue}>{formatTime(order.createdAt)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment Method</Text>
            <Text style={styles.infoValue}>{order.paymentMethod || 'UPI'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>
                {order.isPaid ? 'Paid' : 'Pending'}
              </Text>
            </View>
          </View>
        </View>

        {/* Products Section */}
        <Text style={styles.sectionTitle}>Products Purchased</Text>

        {order.orderItems.map((item, index) => (
          <View key={index} style={styles.productCard}>
            <View style={styles.productLeft}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productMeta}>
                Weight: {item.weight}g | Qty: {item.quantity}
              </Text>
            </View>
            <View style={styles.productRight}>
              <Text style={styles.productPrice}>
                ${(item.price * item.quantity).toFixed(2)}
              </Text>
              <Text style={styles.productUnit}>
                ${item.price.toFixed(2)} each
              </Text>
            </View>
          </View>
        ))}

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Items</Text>
            <Text style={styles.summaryValue}>
              {order.orderItems.reduce((sum, item) => sum + item.quantity, 0)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Weight</Text>
            <Text style={styles.summaryValue}>{order.totalWeight.toFixed(2)} L</Text>
          </View>
          {order.taxPrice > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax</Text>
              <Text style={styles.summaryValue}>${order.taxPrice.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>${order.totalPrice.toFixed(2)}</Text>
          </View>
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
  backButton: {
    padding: moderateScale(4),
  },
  headerTitle: {
    fontSize: moderateScale(22),
    fontWeight: 'bold',
    color: '#111',
  },
  placeholder: {
    width: moderateScale(32),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(5),
  },
  errorText: {
    fontSize: moderateScale(20),
    fontWeight: '600',
    color: '#666',
    marginTop: hp(2),
    marginBottom: hp(3),
  },
  backBtn: {
    backgroundColor: '#123F7A',
    borderRadius: moderateScale(25),
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(8),
  },
  backBtnText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(12),
    padding: wp(4),
    marginBottom: hp(2.5),
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1.2),
  },
  infoLabel: {
    fontSize: moderateScale(14),
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: moderateScale(14),
    color: '#111',
    fontWeight: '600',
    maxWidth: wp(50),
    textAlign: 'right',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F4FD',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.6),
    borderRadius: moderateScale(20),
  },
  statusDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: '#10b981',
    marginRight: wp(1.5),
  },
  statusText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#123F7A',
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#111',
    marginBottom: hp(1.5),
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
  productMeta: {
    fontSize: moderateScale(12),
    color: '#666',
  },
  productRight: {
    alignItems: 'flex-end',
  },
  productPrice: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#111',
    marginBottom: hp(0.3),
  },
  productUnit: {
    fontSize: moderateScale(11),
    color: '#999',
  },
  summaryCard: {
    backgroundColor: '#D6E8FF',
    borderRadius: moderateScale(16),
    padding: wp(5),
    marginTop: hp(2),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(1.2),
  },
  summaryLabel: {
    fontSize: moderateScale(14),
    color: '#111',
  },
  summaryValue: {
    fontSize: moderateScale(14),
    color: '#111',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#123F7A',
    opacity: 0.2,
    marginVertical: hp(1),
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(0.5),
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
});
