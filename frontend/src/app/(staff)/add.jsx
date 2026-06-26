import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Ionicons } from '@expo/vector-icons';
import BarcodeScanner from '../../components/BarcodeScanner';
import api from '../../utils/api';
import { wp, hp, moderateScale, isTablet } from '../../utils/responsive';

export default function StaffAdd() {
  const { user } = useAuth();
  const toast = useToast();
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    barcode: '',
    productName: '',
    price: '',
    stockQuantity: '',
    weight: '',
    weightUnit: 'Kg',
  });

  const handleBarcodeScanned = async (data) => {
    // Check if barcode already exists
    try {
      const response = await api.get(`/products/barcode/${data}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      
      if (response.data.success) {
        Alert.alert('Error', 'Product barcode already exists');
        return;
      }
    } catch (err) {
      // Barcode doesn't exist, which is what we want
      if (err.response?.status === 404) {
        setFormData({ ...formData, barcode: data });
        setShowScanner(false);
      } else {
        Alert.alert('Error', 'Failed to validate barcode');
      }
    }
  };

  const openScanner = () => {
    setShowScanner(true);
  };

  const validateForm = () => {
    if (!formData.barcode.trim()) {
      Alert.alert('Error', 'Please enter or scan a barcode');
      return false;
    }
    if (!formData.productName.trim()) {
      Alert.alert('Error', 'Please enter product name');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return false;
    }
    if (!formData.stockQuantity || parseInt(formData.stockQuantity) <= 0) {
      Alert.alert('Error', 'Please enter a valid stock quantity');
      return false;
    }
    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      Alert.alert('Error', 'Please enter a valid weight');
      return false;
    }
    return true;
  };

  const handleAddProduct = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await api.post(
        '/products',
        {
          name: formData.productName,
          barcode: formData.barcode,
          price: parseFloat(formData.price),
          stockQuantity: parseInt(formData.stockQuantity),
          weight: parseFloat(formData.weight),
          weightUnit: formData.weightUnit,
        },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );

      if (response.data.success) {
        Alert.alert('Success', 'Product added successfully!', [
          {
            text: 'OK',
            onPress: () => {
              // Clear form
              setFormData({
                barcode: '',
                productName: '',
                price: '',
                stockQuantity: '',
                weight: '',
                weightUnit: 'Kg',
              });
            },
          },
        ]);
      }
    } catch (err) {
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Failed to add product'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.storeName}>{user?.storeName || 'Store'}</Text>
          <View style={styles.badge}>
            <View style={styles.dot} />
            <Text style={styles.badgeText}>STAFF</Text>
          </View>
        </View>

        <Text style={styles.pageTitle}>Add Product</Text>

        {/* Barcode */}
        <Text style={styles.label}>Barcode :</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, styles.inputWithButton]}
            placeholder="eg : 787584738"
            placeholderTextColor="#999"
            value={formData.barcode}
            onChangeText={(text) => setFormData({ ...formData, barcode: text })}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.scanButton} onPress={openScanner}>
            <Ionicons name="barcode-outline" size={24} color="#123F7A" />
          </TouchableOpacity>
        </View>

        {/* Product Name */}
        <Text style={styles.label}>Product Name :</Text>
        <TextInput
          style={styles.input}
          placeholder="eg : Milk"
          placeholderTextColor="#999"
          value={formData.productName}
          onChangeText={(text) =>
            setFormData({ ...formData, productName: text })
          }
        />

        {/* Price */}
        <Text style={styles.label}>Price (₹) :</Text>
        <TextInput
          style={styles.input}
          placeholder="eg : ₹200"
          placeholderTextColor="#999"
          value={formData.price}
          onChangeText={(text) => setFormData({ ...formData, price: text })}
          keyboardType="decimal-pad"
        />

        {/* Stock Quantity */}
        <Text style={styles.label}>Stock Quantity :</Text>
        <TextInput
          style={styles.input}
          placeholder="eg : 200"
          placeholderTextColor="#999"
          value={formData.stockQuantity}
          onChangeText={(text) =>
            setFormData({ ...formData, stockQuantity: text })
          }
          keyboardType="number-pad"
        />

        {/* Weight */}
        <Text style={styles.label}>Weight :</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, styles.inputWithButton]}
            placeholder="eg : 500"
            placeholderTextColor="#999"
            value={formData.weight}
            onChangeText={(text) => setFormData({ ...formData, weight: text })}
            keyboardType="decimal-pad"
          />
          <TouchableOpacity
            style={styles.unitButton}
            onPress={() =>
              setFormData({
                ...formData,
                weightUnit: formData.weightUnit === 'Kg' ? 'g' : 'Kg',
              })
            }
          >
            <Text style={styles.unitText}>{formData.weightUnit}</Text>
          </TouchableOpacity>
        </View>

        {/* Add Product Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddProduct}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.addButtonText}>Add Product</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Barcode Scanner */}
      <BarcodeScanner
        visible={showScanner}
        onScan={handleBarcodeScanned}
        onClose={() => setShowScanner(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F7FA' },
  scrollView: { flex: 1 },
  content: {
    padding: wp(5),
    paddingBottom: hp(10),
    maxWidth: isTablet ? 600 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp(2.5),
    marginBottom: hp(2),
  },
  storeName: {
    fontSize: moderateScale(26),
    fontWeight: 'bold',
    color: '#0A3B7C',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
    borderRadius: moderateScale(20),
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.7),
  },
  dot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: '#3b82f6',
    marginRight: wp(1.5),
  },
  badgeText: { fontSize: moderateScale(12), fontWeight: '600', color: '#333' },
  pageTitle: {
    fontSize: moderateScale(22),
    fontWeight: 'bold',
    color: '#111',
    marginBottom: hp(3),
  },
  label: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#111',
    marginBottom: hp(1),
    marginLeft: wp(1),
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: moderateScale(12),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.8),
    fontSize: moderateScale(14),
    marginBottom: hp(2.5),
    color: '#111',
  },
  inputRow: {
    flexDirection: 'row',
    gap: wp(2),
    marginBottom: hp(2.5),
  },
  inputWithButton: {
    flex: 1,
    marginBottom: 0,
  },
  scanButton: {
    width: wp(14),
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  unitButton: {
    width: wp(18),
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  unitText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#123F7A',
  },
  addButton: {
    backgroundColor: '#123F7A',
    borderRadius: moderateScale(25),
    paddingVertical: hp(1.8),
    alignItems: 'center',
    marginTop: hp(3),
  },
  addButtonText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
});
