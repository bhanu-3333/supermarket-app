import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert, Modal } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { Ionicons } from '@expo/vector-icons';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function StaffStock() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [sortBy, setSortBy] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, searchQuery, sortBy, stockFilter]);

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
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...products];

    // Search filter
    if (searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery)
      );
    }

    // Stock filter
    if (stockFilter === 'low') {
      result = result.filter(p => p.stockQuantity > 0 && p.stockQuantity < 10);
    } else if (stockFilter === 'out') {
      result = result.filter(p => p.stockQuantity === 0);
    }

    // Sort
    if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(result);
  };

  const handleRestock = async (productId) => {
    Alert.prompt(
      'Restock Product',
      'Enter quantity to add:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: async (quantity) => {
            if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
              Alert.alert('Error', 'Please enter a valid quantity');
              return;
            }
            try {
              const { data } = await api.put(`/products/${productId}/restock`, 
                { quantity: parseInt(quantity) },
                { headers: { Authorization: `Bearer ${user?.token}` } }
              );
              if (data.success) {
                Alert.alert('Success', 'Stock updated successfully');
                fetchProducts();
              }
            } catch (err) {
              Alert.alert('Error', 'Failed to update stock');
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const handleDelete = async (productId, productName) => {
    setProductToDelete({ id: productId, name: productName });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      const { data } = await api.delete(`/products/${productToDelete.id}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (data.success) {
        Alert.alert('Success', 'Product deleted successfully');
        setShowDeleteModal(false);
        setProductToDelete(null);
        fetchProducts();
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to delete product');
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const renderProduct = ({ item }) => {
    const isLowStock = item.stockQuantity > 0 && item.stockQuantity < 10;
    const isOutOfStock = item.stockQuantity === 0;

    return (
      <View style={styles.productCard}>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productWeight}>{item.weight}{item.weightUnit}</Text>
          <View style={styles.barcodeRow}>
            <Ionicons name="barcode-outline" size={14} color="#666" />
            <Text style={styles.barcode}>{item.barcode}</Text>
          </View>
        </View>
        <View style={styles.productMeta}>
          <Text style={styles.productPrice}>${item.price}</Text>
          <View style={[
            styles.stockBadge,
            isOutOfStock && styles.stockBadgeOut,
            isLowStock && styles.stockBadgeLow
          ]}>
            <Text style={[
              styles.stockText,
              isOutOfStock && styles.stockTextOut,
              isLowStock && styles.stockTextLow
            ]}>
              {isOutOfStock ? 'Out of stock' : `${item.stockQuantity} Units`}
            </Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => handleRestock(item._id)}
          >
            <Ionicons name="add-circle" size={28} color="#22c55e" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => handleDelete(item._id, item.name)}
          >
            <Ionicons name="trash-outline" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#123F7A" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.storeName}>{user?.storeName || 'Store'}</Text>
        <View style={styles.badge}>
          <View style={styles.dot} />
          <Text style={styles.badgeText}>STAFF</Text>
        </View>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          style={styles.filterBtn}
          onPress={() => setShowFilter(true)}
        >
          <Ionicons name="options-outline" size={24} color="#123F7A" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        }
      />

      <Modal visible={showFilter} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sort By</Text>
            
            <TouchableOpacity 
              style={styles.filterOption}
              onPress={() => setSortBy('name-asc')}
            >
              <Text style={styles.filterText}>Name ( A-Z )</Text>
              {sortBy === 'name-asc' && <Ionicons name="checkmark" size={20} color="#123F7A" />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.filterOption}
              onPress={() => setSortBy('price-asc')}
            >
              <Text style={styles.filterText}>Price ( Low - High )</Text>
              {sortBy === 'price-asc' && <Ionicons name="checkmark" size={20} color="#123F7A" />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.filterOption}
              onPress={() => setSortBy('price-desc')}
            >
              <Text style={styles.filterText}>Price ( High - Low )</Text>
              {sortBy === 'price-desc' && <Ionicons name="checkmark" size={20} color="#123F7A" />}
            </TouchableOpacity>

            <Text style={[styles.modalTitle, { marginTop: 20 }]}>Stock</Text>

            <TouchableOpacity 
              style={styles.filterOption}
              onPress={() => setStockFilter('')}
            >
              <Text style={styles.filterText}>All product</Text>
              {stockFilter === '' && <Ionicons name="checkmark" size={20} color="#123F7A" />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.filterOption}
              onPress={() => setStockFilter('low')}
            >
              <Text style={styles.filterText}>Low stock</Text>
              {stockFilter === 'low' && <Ionicons name="checkmark" size={20} color="#123F7A" />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.filterOption}
              onPress={() => setStockFilter('out')}
            >
              <Text style={styles.filterText}>Out of stock</Text>
              {stockFilter === 'out' && <Ionicons name="checkmark" size={20} color="#123F7A" />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.filterBtn2}
              onPress={() => setShowFilter(false)}
            >
              <Text style={styles.filterBtnText}>Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <DeleteConfirmationModal
        visible={showDeleteModal}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setProductToDelete(null);
        }}
        title="Are You sure want to delete this product?"
        buttonText="Delete"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  storeName: { fontSize: 26, fontWeight: 'bold', color: '#0A3B7C' },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f4f8', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3b82f6', marginRight: 6 },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#333' },
  searchRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#333' },
  filterBtn: { width: 50, height: 50, backgroundColor: '#f5f5f5', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  list: { paddingBottom: 20 },
  productCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  productInfo: { flex: 1 },
  productName: { fontSize: 16, fontWeight: '600', color: '#111', marginBottom: 4 },
  productWeight: { fontSize: 13, color: '#666', marginBottom: 6 },
  barcodeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  barcode: { fontSize: 12, color: '#666' },
  productMeta: { alignItems: 'flex-end', marginRight: 12 },
  productPrice: { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 8 },
  stockBadge: { backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  stockBadgeLow: { backgroundColor: '#FFE8E8' },
  stockBadgeOut: { backgroundColor: '#e5e5e5' },
  stockText: { fontSize: 12, color: '#666' },
  stockTextLow: { color: '#ef4444' },
  stockTextOut: { color: '#999' },
  actions: { flexDirection: 'column', gap: 8 },
  actionBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  emptyCard: { backgroundColor: '#f9f9f9', borderRadius: 12, padding: 32, alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#aaa', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 16 },
  filterOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  filterText: { fontSize: 15, color: '#333' },
  filterBtn2: { backgroundColor: '#123F7A', borderRadius: 25, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  filterBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
