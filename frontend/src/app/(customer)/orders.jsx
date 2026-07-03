import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import api from '../../utils/api';
import { wp, hp, moderateScale } from '../../utils/responsive';

export default function OrdersScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/customer', {
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      if (data.success) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
  };

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const handleOrderPress = (order) => {
    router.push({
      pathname: '/(customer)/order-details',
      params: { orderId: order._id },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order History</Text>
          <View style={styles.placeholder} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#123F7A" />
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>No orders yet</Text>
            <Text style={styles.emptySubtext}>Start shopping to see your orders here</Text>
          </View>
        ) : (
          orders.map((order) => (
            <TouchableOpacity
              key={order._id}
              style={styles.orderCard}
              onPress={() => handleOrderPress(order)}
            >
              <View style={styles.orderHeader}>
                <Text style={styles.orderIdLabel}>Order ID</Text>
                <Text style={styles.orderId} numberOfLines={1}>
                  {order._id}
                </Text>
              </View>

              <View style={styles.orderDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>
                    {formatDate(order.createdAt)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>
                    {formatTime(order.createdAt)}
                  </Text>
                </View>
              </View>

              <View style={styles.orderFooter}>
                <View>
                  <Text style={styles.amountLabel}>Total Amount</Text>
                  <Text style={styles.amountValue}>${order.totalPrice.toFixed(2)}</Text>
                </View>
                <View style={styles.itemsCount}>
                  <Ionicons name="cart-outline" size={16} color="#123F7A" />
                  <Text style={styles.itemsText}>
                    {order.orderItems.length} {order.orderItems.length === 1 ? 'item' : 'items'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
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
    marginTop: hp(20),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(15),
  },
  emptyText: {
    fontSize: moderateScale(20),
    fontWeight: '600',
    color: '#666',
    marginTop: hp(2),
  },
  emptySubtext: {
    fontSize: moderateScale(14),
    color: '#999',
    marginTop: hp(1),
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(12),
    padding: wp(4),
    marginBottom: hp(2),
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  orderHeader: {
    marginBottom: hp(1.5),
  },
  orderIdLabel: {
    fontSize: moderateScale(12),
    color: '#666',
    marginBottom: hp(0.3),
  },
  orderId: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#111',
  },
  orderDetails: {
    flexDirection: 'row',
    gap: wp(4),
    marginBottom: hp(1.5),
    paddingVertical: hp(1),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.5),
  },
  detailText: {
    fontSize: moderateScale(13),
    color: '#666',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: moderateScale(12),
    color: '#666',
    marginBottom: hp(0.3),
  },
  amountValue: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#111',
  },
  itemsCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.5),
    backgroundColor: '#E8F4FD',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    borderRadius: moderateScale(20),
  },
  itemsText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#123F7A',
  },
});
