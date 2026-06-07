import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { Ionicons } from '@expo/vector-icons';


const { width } = Dimensions.get('window');

export default function StaffDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalStock: 0, lowStock: 0, recentProducts: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await api.get('/staff/dashboard', {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (data.success) setStats(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      <View style={styles.productLeft}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productWeight}>{item.weight}{item.weightUnit}</Text>
        <View style={styles.barcodeRow}>
          <Ionicons name="barcode-outline" size={14} color="#666" />
          <Text style={styles.barcode}>{item.barcode}</Text>
        </View>
      </View>
      <View style={styles.productRight}>
        <Text style={styles.productPrice}>${item.price}</Text>
        <Text style={styles.productStock}>{item.stockQuantity} Units</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#123F7A" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.storeName}>{user?.storeName || 'Store'}</Text>
        <View style={styles.badge}>
          <View style={styles.dot} />
          <Text style={styles.badgeText}>STAFF</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <View style={styles.statCard}>
          <View style={[styles.iconCircle, { backgroundColor: '#E8F4FD' }]}>
            <Ionicons name="cube-outline" size={24} color="#123F7A" />
          </View>
          <Text style={styles.statLabel}>Total Stock</Text>
          <Text style={styles.statValue}>{stats.totalStock}</Text>
          <Text style={styles.statSub}>Items in Inventory</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.iconCircle, { backgroundColor: '#FFE8E8' }]}>
            <Ionicons name="alert-circle-outline" size={24} color="#ef4444" />
          </View>
          <Text style={styles.statLabel}>Low Stock</Text>
          <Text style={[styles.statValue, { color: '#ef4444' }]}>{stats.lowStock}</Text>
          <Text style={styles.statSub}>Restock needed</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.addCard}
        onPress={() => router.push('/(staff)/add')}
      >
        <View style={styles.addLeft}>
          <View style={[styles.iconCircle, { backgroundColor: '#E8F0FF' }]}>
            <Ionicons name="bag-add-outline" size={24} color="#123F7A" />
          </View>
          <View>
            <Text style={styles.addTitle}>Add Items</Text>
            <Text style={styles.addSub}>Scan your product</Text>
          </View>
        </View>
        <View style={styles.addButton}>
          <Ionicons name="add" size={32} color="#123F7A" />
        </View>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Recent Product</Text>

      {stats.recentProducts.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No products yet</Text>
        </View>
      ) : (
        <FlatList
          data={stats.recentProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id}
          scrollEnabled={false}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: width * 0.05, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 20, flexWrap: 'wrap' },
  storeName: { fontSize: Math.min(width * 0.065, 26), fontWeight: 'bold', color: '#0A3B7C', maxWidth: '70%' },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f4f8', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3b82f6', marginRight: 6 },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#333' },
  grid: { flexDirection: width < 400 ? 'column' : 'row', gap: 12, marginBottom: 16 },
  statCard: { flex: width < 400 ? 0 : 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  iconCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statLabel: { fontSize: 12, color: '#666', marginBottom: 4 },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#111', marginBottom: 2 },
  statSub: { fontSize: 11, color: '#888' },
  addCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 24, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  addLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  addTitle: { fontSize: 18, fontWeight: '600', color: '#111' },
  addSub: { fontSize: 13, color: '#888', marginTop: 2 },
  addButton: { width: width < 400 ? 80 : 120, height: 60, backgroundColor: '#D6E8FF', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 14 },
  productCard: { flexDirection: width < 400 ? 'column' : 'row', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  productLeft: { flex: 1 },
  productName: { fontSize: 16, fontWeight: '600', color: '#111', marginBottom: 4 },
  productWeight: { fontSize: 13, color: '#666', marginBottom: 6 },
  barcodeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  barcode: { fontSize: 12, color: '#666' },
  productRight: { alignItems: width < 400 ? 'flex-start' : 'flex-end', marginTop: width < 400 ? 12 : 0 },
  productPrice: { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  productStock: { fontSize: 12, color: '#888', backgroundColor: '#f0f0f0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  emptyCard: { backgroundColor: '#f9f9f9', borderRadius: 12, padding: 32, alignItems: 'center' },
  emptyText: { color: '#aaa', fontSize: 14 },
});
