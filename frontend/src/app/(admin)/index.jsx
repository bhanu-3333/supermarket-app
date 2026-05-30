import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

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
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 20 },
  storeName: { fontSize: 26, fontWeight: 'bold', color: '#0A3B7C' },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f4f8', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e', marginRight: 6 },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#333' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  statCard: { width: '47%', backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  statLabel: { fontSize: 12, color: '#666', marginBottom: 8 },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  statSub: { fontSize: 11, color: '#888' },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 14 },
  orderCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  orderIdLabel: { fontSize: 10, color: '#888' },
  orderId: { fontSize: 12, color: '#333', fontWeight: '500', maxWidth: 180 },
  orderDate: { fontSize: 11, color: '#aaa', marginTop: 4 },
  orderRight: { alignItems: 'flex-end' },
  orderPrice: { fontSize: 20, fontWeight: 'bold', color: '#111' },
  orderWeight: { fontSize: 11, color: '#888', marginTop: 4 },
  emptyCard: { backgroundColor: '#f9f9f9', borderRadius: 12, padding: 24, alignItems: 'center' },
  emptyText: { color: '#aaa', fontSize: 14 },
});
