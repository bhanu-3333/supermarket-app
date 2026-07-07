import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { wp, hp, moderateScale } from '../../utils/responsive';

function StatCard({ imageSource, label, value, sub }) {
  return (
    <View style={styles.statCard}>
      <Image 
        source={imageSource} 
        style={styles.cardIcon}
        resizeMode="contain"
      />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
    </View>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalSalesMonth: 0,
    totalSalesToday: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [dashData, ordersData] = await Promise.all([
          api.get('/admin/dashboard', {
            headers: { Authorization: `Bearer ${user?.token}` },
          }),
          api.get('/orders/recent', {
            headers: { Authorization: `Bearer ${user?.token}` },
          })
        ]);
        
        if (dashData.data.success) {
          setStats(dashData.data.data);
        }
        if (ordersData.data.success) {
          setOrders(ordersData.data.data);
        }
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.storeName}>{user?.storeName || 'My Store'}</Text>
          <View style={styles.badge}>
            <View style={styles.dot} />
            <Text style={styles.badgeText}>ADMIN</Text>
          </View>
        </View>

        {/* Stats Grid - 2x2 Layout */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <StatCard
              imageSource={require('../../../assets/images/img1.png')}
              label="Total sales of the month"
              value={`$${stats.totalSalesMonth.toFixed(2)}`}
              sub="Monthly revenue"
            />
            <StatCard
              imageSource={require('../../../assets/images/img2.png')}
              label="Total sales of the day"
              value={`$${stats.totalSalesToday.toFixed(2)}`}
              sub="Today's revenue"
            />
          </View>
          
          <View style={styles.statsRow}>
            <StatCard
              imageSource={require('../../../assets/images/img4.png')}
              label="Total Customer"
              value={stats.totalCustomers}
              sub="Registered customers"
            />
            <StatCard
              imageSource={require('../../../assets/images/img3.png')}
              label="Total Stock"
              value={stats.totalProducts}
              sub="Items in Inventory"
            />
          </View>
        </View>

        {/* Recent Orders */}
        <Text style={styles.sectionTitle}>Recent orders</Text>
        
        {loading ? (
          <ActivityIndicator color="#123F7A" style={{ marginTop: 20 }} />
        ) : orders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No recent orders</Text>
          </View>
        ) : (
          orders.map((order) => (
            <View key={order._id} style={styles.orderCard}>
              <View style={styles.orderLeft}>
                <Text style={styles.customerName}>{order.user?.name || 'Customer'}</Text>
                <Text style={styles.orderDate}>
                  {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}
                </Text>
              </View>
              <View style={styles.orderRight}>
                <Text style={styles.orderPrice}>${order.totalPrice.toFixed(2)}</Text>
                <Text style={styles.orderWeight}>
                  Total weight: <Text style={styles.orderWeightBold}>{order.totalWeight}kg</Text>
                </Text>
              </View>
            </View>
          ))
        )}
        
        <View style={styles.bottomSpacer} />
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
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    paddingBottom: hp(15),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(3),
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
    backgroundColor: '#22c55e',
    marginRight: wp(1.5),
  },
  badgeText: { 
    fontSize: moderateScale(11), 
    fontWeight: '700', 
    color: '#0A3B7C',
    letterSpacing: 0.5,
  },
  
  // Stats Grid - 2x2 Layout
  statsContainer: {
    marginBottom: hp(2.5),
  },
  statsRow: {
    flexDirection: 'row',
    gap: wp(3.5),
    marginBottom: hp(2),
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: moderateScale(16),
    padding: wp(4.5),
    alignItems: 'flex-start',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    minHeight: hp(18),
  },
  cardIcon: {
    width: moderateScale(48),
    height: moderateScale(48),
    marginBottom: hp(1.8),
  },
  statLabel: {
    fontSize: moderateScale(12),
    color: '#6b7280',
    marginBottom: hp(0.8),
    fontWeight: '500',
    lineHeight: moderateScale(16),
  },
  statValue: {
    fontSize: moderateScale(26),
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: hp(0.4),
  },
  statSub: {
    fontSize: moderateScale(11),
    color: '#9ca3af',
    fontWeight: '400',
  },
  
  // Recent Orders
  sectionTitle: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: hp(2),
    marginTop: hp(2),
  },
  orderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: moderateScale(16),
    padding: wp(4),
    marginBottom: hp(1.5),
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  orderLeft: {
    flex: 1,
    marginRight: wp(2),
  },
  customerName: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: '#111827',
    marginBottom: hp(0.8),
  },
  orderIdLabel: {
    fontSize: moderateScale(10),
    color: '#9ca3af',
    marginBottom: hp(0.3),
  },
  orderId: {
    fontSize: moderateScale(11),
    color: '#111827',
    fontWeight: '500',
    marginBottom: hp(0.8),
  },
  orderDate: {
    fontSize: moderateScale(11),
    color: '#9ca3af',
  },
  orderRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  orderPrice: {
    fontSize: moderateScale(22),
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: hp(0.5),
  },
  orderWeight: {
    fontSize: moderateScale(11),
    color: '#9ca3af',
  },
  orderWeightBold: {
    fontWeight: 'bold',
    color: '#111827',
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(16),
    padding: hp(4),
    alignItems: 'center',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: moderateScale(14),
  },
  bottomSpacer: {
    height: hp(2),
  },
});
