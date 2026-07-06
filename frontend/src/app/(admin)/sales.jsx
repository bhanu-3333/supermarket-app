import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../../utils/api';
import { wp, hp, moderateScale } from '../../utils/responsive';

export default function AdminSales() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Date & Orders
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [orders, setOrders] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  
  // Filter States
  const [filterType, setFilterType] = useState({
    sales: '',
    customer: ''
  });

  useEffect(() => {
    fetchOrdersByDate(selectedDate);
  }, []);

  const fetchOrdersByDate = async (date) => {
    setLoading(true);
    try {
      const dateStr = date.toISOString().split('T')[0];
      const { data } = await api.get(`/orders/date/${dateStr}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      
      if (data.success) {
        setOrders(data.data.orders);
        setTotalSales(data.data.totalSales);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = async () => {
    setShowFilterModal(false);

    // Navigate to chart screens for yearly filters
    if (filterType.sales === 'yearly') {
      router.push('/(admin)/yearly-sales');
      return;
    }

    if (filterType.customer === 'yearly') {
      router.push('/(admin)/yearly-customer');
      return;
    }

    // For other filters, fetch data
    setLoading(true);
    try {
      let endpoint = '';
      
      // Sales filters
      if (filterType.sales === 'today') {
        endpoint = '/admin/sales/today';
      } else if (filterType.sales === 'monthly') {
        endpoint = '/admin/sales/monthly';
      }
      // Customer filters
      else if (filterType.customer === 'today') {
        endpoint = '/admin/customers/today';
      } else if (filterType.customer === 'monthly') {
        endpoint = '/admin/customers/monthly';
      }

      if (endpoint) {
        const { data } = await api.get(endpoint, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });

        if (data.success) {
          setOrders(data.data.orders || []);
          setTotalSales(data.data.totalRevenue || 0);
        }
      }
    } catch (err) {
      console.error('Error applying filter:', err);
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event, date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
      fetchOrdersByDate(date);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB').replace(/\//g, '/');
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const renderOrderCard = (order) => (
    <View key={order._id} style={styles.orderCard}>
      <View style={styles.orderLeft}>
        <Text style={styles.orderIdLabel}>OrderID :</Text>
        <Text style={styles.orderId} numberOfLines={1}>
          {order._id}
        </Text>
        <Text style={styles.orderDateTime}>
          {formatDate(new Date(order.createdAt))}  {formatTime(order.createdAt)}
        </Text>
      </View>
      <View style={styles.orderRight}>
        <Text style={styles.orderPrice}>{order.totalPrice.toFixed(2)}$</Text>
        <Text style={styles.orderWeight}>
          Total weight: <Text style={styles.orderWeightBold}>{order.totalWeight}kg</Text>
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.storeName}>{user?.storeName || 'Store'}</Text>
          <View style={styles.badge}>
            <View style={styles.dot} />
            <Text style={styles.badgeText}>ADMIN</Text>
          </View>
        </View>

        {/* Date Selector & Filter */}
        <View style={styles.selectorRow}>
          <TouchableOpacity 
            style={styles.dateSelector}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <Text style={styles.dateSelectorText}>
              {selectedDate ? selectedDate.toLocaleDateString('en-GB') : 'Select date'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterIcon}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="options-outline" size={24} color="#111" />
          </TouchableOpacity>
        </View>

        {/* Date & Sales Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryLeft}>
            <Text style={styles.summaryLabel}>Date</Text>
            <Text style={styles.summaryValue}>{formatDate(selectedDate)}</Text>
          </View>
          <View style={styles.summaryRight}>
            <Text style={styles.summaryLabel}>Sales</Text>
            <Text style={styles.summaryValueGreen}>${totalSales.toFixed(2)}</Text>
          </View>
        </View>

        {/* Customer Details Section */}
        <Text style={styles.sectionTitle}>Customer details</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#123F7A" style={styles.loader} />
        ) : orders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No orders for this date</Text>
          </View>
        ) : (
          orders.map(renderOrderCard)
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
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
            <Text style={styles.modalTitle}>Sales</Text>

            <TouchableOpacity
              style={styles.filterOption}
              onPress={() => setFilterType({ ...filterType, sales: 'yearly', customer: '' })}
            >
              <Text style={styles.filterOptionText}>Yearly sales</Text>
              <View style={styles.checkbox}>
                {filterType.sales === 'yearly' && (
                  <Ionicons name="checkmark" size={18} color="#123F7A" />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterOption}
              onPress={() => setFilterType({ ...filterType, sales: 'monthly', customer: '' })}
            >
              <Text style={styles.filterOptionText}>Monthly sales</Text>
              <View style={styles.checkbox}>
                {filterType.sales === 'monthly' && (
                  <Ionicons name="checkmark" size={18} color="#123F7A" />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterOption}
              onPress={() => setFilterType({ ...filterType, sales: 'today', customer: '' })}
            >
              <Text style={styles.filterOptionText}>Today sales</Text>
              <View style={styles.checkbox}>
                {filterType.sales === 'today' && (
                  <Ionicons name="checkmark" size={18} color="#123F7A" />
                )}
              </View>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Customer</Text>

            <TouchableOpacity
              style={styles.filterOption}
              onPress={() => setFilterType({ ...filterType, customer: 'yearly', sales: '' })}
            >
              <Text style={styles.filterOptionText}>Yearly customer</Text>
              <View style={styles.checkbox}>
                {filterType.customer === 'yearly' && (
                  <Ionicons name="checkmark" size={18} color="#123F7A" />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterOption}
              onPress={() => setFilterType({ ...filterType, customer: 'monthly', sales: '' })}
            >
              <Text style={styles.filterOptionText}>Monthly customer</Text>
              <View style={styles.checkbox}>
                {filterType.customer === 'monthly' && (
                  <Ionicons name="checkmark" size={18} color="#123F7A" />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterOption}
              onPress={() => setFilterType({ ...filterType, customer: 'today', sales: '' })}
            >
              <Text style={styles.filterOptionText}>Today customer</Text>
              <View style={styles.checkbox}>
                {filterType.customer === 'today' && (
                  <Ionicons name="checkmark" size={18} color="#123F7A" />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.filterButton} 
              onPress={applyFilter}
            >
              <Text style={styles.filterButtonText}>Filter</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
    backgroundColor: '#22c55e',
    marginRight: wp(1.5),
  },
  badgeText: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    color: '#0A3B7C',
    letterSpacing: 0.5,
  },
  selectorRow: {
    flexDirection: 'row',
    gap: wp(3),
    marginBottom: hp(2.5),
  },
  dateSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: moderateScale(12),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    gap: wp(2),
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  dateSelectorText: {
    fontSize: moderateScale(14),
    color: '#666',
  },
  filterIcon: {
    width: wp(12),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: moderateScale(12),
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(3),
  },
  summaryLeft: {
    flex: 1,
  },
  summaryRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  summaryLabel: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#111827',
    marginBottom: hp(0.5),
  },
  summaryValue: {
    fontSize: moderateScale(16),
    color: '#6b7280',
  },
  summaryValueGreen: {
    fontSize: moderateScale(16),
    color: '#10b981',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: hp(1.5),
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
  orderDateTime: {
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
  loader: {
    marginTop: hp(5),
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
    color: '#111827',
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
    color: '#6b7280',
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
  filterButton: {
    backgroundColor: '#123F7A',
    borderRadius: moderateScale(25),
    paddingVertical: hp(1.5),
    alignItems: 'center',
    marginTop: hp(3),
  },
  filterButtonText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
});
