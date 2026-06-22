import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { wp, hp, moderateScale, isTablet } from '../../utils/responsive';

function StatCard({ label, value, sub, valueColor }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, valueColor && { color: valueColor }]}>{value}</Text>
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.storeName}>{user?.storeName || 'My Store'}</Text>
        <View style={styles.badge}>
          <View style={styles.dot} />
          <Text style={styles.badgeText}>ADMIN</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.grid}>
        <StatCard 
          label="Total sales of the month" 
          value={`$${stats.totalSalesMonth.toFixed(2)}`} 
          sub="Monthly revenue" 
          valueColor="#22c55e" 
        />
        <StatCard 
          label="Total sales of the day" 
          value={`$${stats.totalSalesToday.toFixed(2)}`} 
          sub="Today's revenue" 
          valueColor="#3b82f6" 
        />
        <StatCard 
          label="Total Customer" 
          value={stats.totalCustomers} 
          sub="Registered customers" 
        />
        <StatCard 
          label="Total Stock" 
          value={stats.totalProducts} 
          sub="Items in Inventory" 
        />
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
            <View>
              <Text style={styles.orderIdLabel}>OrderID :</Text>
              <Text style={styles.orderId}>{order._id}</Text>
              <Text style={styles.orderDate}>
                {new Date(order.createdAt).toLocaleString()}
              </Text>
            </View>
            <View style={styles.orderRight}>
              <Text style={styles.orderPrice}>{order.totalPrice}$</Text>
              <Text style={styles.orderWeight}>Total weight: {order.totalWeight}kg</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { 
    padding: wp(5), 
    paddingBottom: hp(5),
    maxWidth: isTablet ? 900 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: hp(3), 
    marginTop: hp(2.5), 
    flexWrap: 'wrap' 
  },
  storeName: { 
    fontSize: moderateScale(26), 
    fontWeight: 'bold', 
    color: '#0A3B7C', 
    maxWidth: '70%' 
  },
  badge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#f0f4f8', 
    borderRadius: moderateScale(20), 
    paddingHorizontal: wp(3), 
    paddingVertical: hp(0.7) 
  },
  dot: { 
    width: moderateScale(8), 
    height: moderateScale(8), 
    borderRadius: moderateScale(4), 
    backgroundColor: '#22c55e', 
    marginRight: wp(1.5) 
  },
  badgeText: { fontSize: moderateScale(12), fontWeight: '600', color: '#333' },
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: wp(3), 
    marginBottom: hp(3.5) 
  },
  statCard: { 
    width: isTablet ? '48%' : wp(44), 
    backgroundColor: '#fff', 
    borderRadius: moderateScale(12), 
    padding: wp(4), 
    minHeight: hp(13),
    elevation: 2, 
    shadowColor: '#000', 
    shadowOpacity: 0.06, 
    shadowRadius: 4, 
    shadowOffset: { width: 0, height: 2 } 
  },
  statLabel: { fontSize: moderateScale(12), color: '#666', marginBottom: hp(1) },
  statValue: { fontSize: moderateScale(22), fontWeight: 'bold', color: '#111', marginBottom: hp(0.5) },
  statSub: { fontSize: moderateScale(11), color: '#888' },
  sectionTitle: { fontSize: moderateScale(20), fontWeight: '700', color: '#111', marginBottom: hp(1.7) },
  orderCard: { 
    flexDirection: isTablet ? 'row' : 'column', 
    justifyContent: 'space-between', 
    alignItems: isTablet ? 'center' : 'flex-start', 
    backgroundColor: '#fff', 
    borderRadius: moderateScale(12), 
    padding: wp(4), 
    marginBottom: hp(1.5), 
    elevation: 2, 
    shadowColor: '#000', 
    shadowOpacity: 0.06, 
    shadowRadius: 4, 
    shadowOffset: { width: 0, height: 2 } 
  },
  orderIdLabel: { fontSize: moderateScale(10), color: '#888' },
  orderId: { 
    fontSize: moderateScale(12), 
    color: '#333', 
    fontWeight: '500', 
    maxWidth: wp(50),
    flexWrap: 'wrap',
  },
  orderDate: { fontSize: moderateScale(11), color: '#aaa', marginTop: hp(0.5) },
  orderRight: { 
    alignItems: isTablet ? 'flex-end' : 'flex-start', 
    marginTop: isTablet ? 0 : hp(1.5) 
  },
  orderPrice: { fontSize: moderateScale(20), fontWeight: 'bold', color: '#111' },
  orderWeight: { fontSize: moderateScale(11), color: '#888', marginTop: hp(0.5) },
  emptyCard: { 
    backgroundColor: '#f9f9f9', 
    borderRadius: moderateScale(12), 
    padding: hp(3), 
    alignItems: 'center' 
  },
  emptyText: { color: '#aaa', fontSize: moderateScale(14) },
});
