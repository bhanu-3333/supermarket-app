import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import api from '../../utils/api';
import { wp, hp, moderateScale } from '../../utils/responsive';

export default function AdminStock() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Filter states
  const [sortBy, setSortBy] = useState('');
  const [stockFilter, setStockFilter] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, products]);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products', {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (data.success) {
        setProducts(data.data);
        setFilteredProducts(data.data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const handleSearch = (query) => {
    if (!query.trim()) {
      setFilteredProducts(products);
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(lowercaseQuery) ||
        product.barcode.toLowerCase().includes(lowercaseQuery)
    );
    setFilteredProducts(filtered);
  };

  const applyFilter = async () => {
    setShowFilterModal(false);
    setLoading(true);

    try {
      let queryParams = [];
      if (sortBy) queryParams.push(`sortBy=${sortBy}`);
      if (stockFilter !== 'all') queryParams.push(`stockFilter=${stockFilter}`);

      const url = queryParams.length > 0 
        ? `/products/filter?${queryParams.join('&')}`
        : '/products';

      const { data } = await api.get(url, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      if (data.success) {
        setProducts(data.data);
        setFilteredProducts(data.data);
      }
    } catch (err) {
      console.error('Error applying filter:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
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
        <Text style={styles.productPrice}>${item.price}</Text>
        <View style={[
          styles.stockBadge,
          item.stockQuantity === 0 && styles.stockBadgeOut,
          item.stockQuantity > 0 && item.stockQuantity <= 10 && styles.stockBadgeLow,
        ]}>
          <Text style={[
            styles.stockText,
            item.stockQuantity === 0 && styles.stockTextOut,
            item.stockQuantity > 0 && item.stockQuantity <= 10 && styles.stockTextLow,
          ]}>
            {item.stockQuantity} Units
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.storeName}>{user?.storeName || 'Store'}</Text>
          <View style={styles.badge}>
            <View style={styles.dot} />
            <Text style={styles.badgeText}>ADMIN</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="options" size={24} color="#123F7A" />
          </TouchableOpacity>
        </View>

        {/* Product List */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#123F7A"
            style={styles.loader}
          />
        ) : filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No matching products found' : 'No products available'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}

        {/* Filter Modal */}
        <Modal
          visible={showFilterModal}
          animationType="fade"
          transparent
          onRequestClose={() => setShowFilterModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowFilterModal(false)}
          >
            <TouchableOpacity
              style={styles.modalContent}
              activeOpacity={1}
              onPress={() => {}}
            >
              <Text style={styles.modalTitle}>Sort By</Text>

              <TouchableOpacity
                style={styles.filterOption}
                onPress={() => setSortBy('name-asc')}
              >
                <Text style={styles.filterOptionText}>Name (A-Z)</Text>
                <View style={styles.checkbox}>
                  {sortBy === 'name-asc' && (
                    <Ionicons name="checkmark" size={18} color="#123F7A" />
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.filterOption}
                onPress={() => setSortBy('price-asc')}
              >
                <Text style={styles.filterOptionText}>Price (Low - High)</Text>
                <View style={styles.checkbox}>
                  {sortBy === 'price-asc' && (
                    <Ionicons name="checkmark" size={18} color="#123F7A" />
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.filterOption}
                onPress={() => setSortBy('price-desc')}
              >
                <Text style={styles.filterOptionText}>Price (High - Low)</Text>
                <View style={styles.checkbox}>
                  {sortBy === 'price-desc' && (
                    <Ionicons name="checkmark" size={18} color="#123F7A" />
                  )}
                </View>
              </TouchableOpacity>

              <Text style={styles.modalTitle}>Stock</Text>

              <TouchableOpacity
                style={styles.filterOption}
                onPress={() => setStockFilter('all')}
              >
                <Text style={styles.filterOptionText}>All product</Text>
                <View style={styles.checkbox}>
                  {stockFilter === 'all' && (
                    <Ionicons name="checkmark" size={18} color="#123F7A" />
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.filterOption}
                onPress={() => setStockFilter('low')}
              >
                <Text style={styles.filterOptionText}>Low stock</Text>
                <View style={styles.checkbox}>
                  {stockFilter === 'low' && (
                    <Ionicons name="checkmark" size={18} color="#123F7A" />
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.filterOption}
                onPress={() => setStockFilter('out')}
              >
                <Text style={styles.filterOptionText}>Out of stock</Text>
                <View style={styles.checkbox}>
                  {stockFilter === 'out' && (
                    <Ionicons name="checkmark" size={18} color="#123F7A" />
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.applyButton} onPress={applyFilter}>
                <Text style={styles.applyButtonText}>Filter</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    paddingBottom: hp(1.5),
    backgroundColor: '#fff',
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    gap: wp(3),
    backgroundColor: '#fff',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: moderateScale(12),
    paddingHorizontal: wp(4),
    gap: wp(2),
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(14),
    color: '#111',
    paddingVertical: hp(1.2),
  },
  filterButton: {
    width: wp(12),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: moderateScale(12),
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: wp(5),
    paddingTop: hp(1),
    paddingBottom: hp(10),
  },
  productCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: moderateScale(12),
    padding: wp(4),
    marginBottom: hp(1.5),
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  productLeft: {
    flex: 1,
  },
  productName: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#111',
    marginBottom: hp(0.8),
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
    marginBottom: hp(0.8),
  },
  stockBadge: {
    backgroundColor: '#E8F4FD',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: moderateScale(12),
  },
  stockBadgeLow: {
    backgroundColor: '#FFF3E0',
  },
  stockBadgeOut: {
    backgroundColor: '#FFE8E8',
  },
  stockText: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    color: '#123F7A',
  },
  stockTextLow: {
    color: '#F57C00',
  },
  stockTextOut: {
    color: '#ef4444',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(10),
  },
  emptyText: {
    fontSize: moderateScale(16),
    color: '#999',
    textAlign: 'center',
  },
  // Filter Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(20),
    padding: wp(6),
    width: wp(80),
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#111',
    marginTop: hp(2),
    marginBottom: hp(1.5),
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(1.2),
  },
  filterOptionText: {
    fontSize: moderateScale(14),
    color: '#666',
  },
  checkbox: {
    width: moderateScale(22),
    height: moderateScale(22),
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: moderateScale(6),
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButton: {
    backgroundColor: '#123F7A',
    borderRadius: moderateScale(25),
    paddingVertical: hp(1.5),
    alignItems: 'center',
    marginTop: hp(3),
  },
  applyButtonText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
});
