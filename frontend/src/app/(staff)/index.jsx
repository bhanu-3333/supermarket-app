import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { Ionicons } from '@expo/vector-icons';
import { wp, hp, moderateScale, isTablet } from '../../utils/responsive';

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
  content: { 
    padding: wp(5), 
    paddingBottom: hp(5),
    maxWidth: isTablet ? 900 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
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
    backgroundColor: '#3b82f6', 
    marginRight: wp(1.5) 
  },
  badgeText: { fontSize: moderateScale(12), fontWeight: '600', color: '#333' },
  grid: { 
    flexDirection: 'row', 
    gap: wp(3), 
    marginBottom: hp(2),
    flexWrap: 'wrap',
  },
  statCard: { 
    flex: 1,
    minWidth: isTablet ? '48%' : wp(43), 
    backgroundColor: '#fff', 
    borderRadius: moderateScale(12), 
    padding: wp(4), 
    elevation: 2, 
    shadowColor: '#000', 
    shadowOpacity: 0.06, 
    shadowRadius: 4, 
    shadowOffset: { width: 0, height: 2 } 
  },
  iconCircle: { 
    width: moderateScale(48), 
    height: moderateScale(48), 
    borderRadius: moderateScale(24), 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: hp(1.5) 
  },
  statLabel: { fontSize: moderateScale(12), color: '#666', marginBottom: hp(0.5) },
  statValue: { fontSize: moderateScale(28), fontWeight: 'bold', color: '#111', marginBottom: hp(0.2) },
  statSub: { fontSize: moderateScale(11), color: '#888' },
  addCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    borderRadius: moderateScale(12), 
    padding: wp(4), 
    marginBottom: hp(3), 
    elevation: 2, 
    shadowColor: '#000', 
    shadowOpacity: 0.06, 
    shadowRadius: 4, 
    shadowOffset: { width: 0, height: 2 } 
  },
  addLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: wp(3), 
    flex: 1 
  },
  addTitle: { fontSize: moderateScale(18), fontWeight: '600', color: '#111' },
  addSub: { fontSize: moderateScale(13), color: '#888', marginTop: hp(0.2) },
  addButton: { 
    width: wp(isTablet ? 15 : 25), 
    height: hp(7), 
    backgroundColor: '#D6E8FF', 
    borderRadius: moderateScale(12), 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  sectionTitle: { fontSize: moderateScale(18), fontWeight: '700', color: '#111', marginBottom: hp(1.7) },
  productCard: { 
    flexDirection: isTablet ? 'row' : 'column', 
    justifyContent: 'space-between', 
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
  productLeft: { flex: 1 },
  productName: { fontSize: moderateScale(16), fontWeight: '600', color: '#111', marginBottom: hp(0.5) },
  productWeight: { fontSize: moderateScale(13), color: '#666', marginBottom: hp(0.7) },
  barcodeRow: { flexDirection: 'row', alignItems: 'center', gap: wp(1) },
  barcode: { fontSize: moderateScale(12), color: '#666' },
  productRight: { 
    alignItems: isTablet ? 'flex-end' : 'flex-start', 
    marginTop: isTablet ? 0 : hp(1.5) 
  },
  productPrice: { fontSize: moderateScale(18), fontWeight: 'bold', color: '#111', marginBottom: hp(0.5) },
  productStock: { 
    fontSize: moderateScale(12), 
    color: '#888', 
    backgroundColor: '#f0f0f0', 
    paddingHorizontal: wp(2.5), 
    paddingVertical: hp(0.5), 
    borderRadius: moderateScale(12) 
  },
  emptyCard: { 
    backgroundColor: '#f9f9f9', 
    borderRadius: moderateScale(12), 
    padding: hp(4), 
    alignItems: 'center' 
  },
  emptyText: { color: '#aaa', fontSize: moderateScale(14) },
});
