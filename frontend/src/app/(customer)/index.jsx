import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import BarcodeScanner from '../../components/BarcodeScanner';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import api from '../../utils/api';
import { wp, hp, moderateScale } from '../../utils/responsive';

export default function CustomerScanner() {
  const router = useRouter();
  const { user } = useAuth();
  const [showScanner, setShowScanner] = useState(false);
  const [cart, setCart] = useState([]);
  const [netWeight, setNetWeight] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [productToRemove, setProductToRemove] = useState(null);

  useEffect(() => {
    calculateTotals();
  }, [cart]);

  const calculateTotals = () => {
    let totalWeight = 0;
    let totalPrice = 0;

    cart.forEach((item) => {
      totalWeight += item.weight * item.quantity;
      totalPrice += item.price * item.quantity;
    });

    setNetWeight(totalWeight);
    setGrandTotal(totalPrice);
  };

  const handleBarcodeScanned = async (data) => {
    try {
      const { data: response } = await api.get(`/products/barcode/${data}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      if (response.success) {
        const product = response.data;
        addToCart(product);
        setShowScanner(false);
      } else {
        Alert.alert('Error', 'Product not found');
      }
    } catch (err) {
      Alert.alert('Error', 'Product not found in this store');
    }
  };

  const addToCart = (product) => {
    const existingIndex = cart.findIndex((item) => item._id === product._id);

    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const increaseQuantity = (productId) => {
    const updatedCart = cart.map((item) =>
      item._id === productId ? { ...item, quantity: item.quantity + 1 } : item
    );
    setCart(updatedCart);
  };

  const decreaseQuantity = (productId) => {
    const product = cart.find((item) => item._id === productId);
    
    if (product && product.quantity === 1) {
      // Show confirmation modal before removing
      setProductToRemove(productId);
      setShowRemoveModal(true);
    } else {
      // Just decrease quantity
      const updatedCart = cart.map((item) =>
        item._id === productId ? { ...item, quantity: item.quantity - 1 } : item
      );
      setCart(updatedCart);
    }
  };

  const confirmRemoveProduct = () => {
    if (productToRemove) {
      const updatedCart = cart.filter((item) => item._id !== productToRemove);
      setCart(updatedCart);
      setShowRemoveModal(false);
      setProductToRemove(null);
    }
  };

  const openScanner = () => {
    setShowScanner(true);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add products to cart before checkout');
      return;
    }
    router.push({
      pathname: '/(customer)/payment',
      params: { cart: JSON.stringify(cart), total: grandTotal, weight: netWeight },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.storeName}>{user?.storeName || 'Store'}</Text>
          <View style={styles.badge}>
            <View style={styles.dot} />
            <Text style={styles.badgeText}>CUSTOMER</Text>
          </View>
        </View>

        {/* Scanner Area */}
        <TouchableOpacity style={styles.scannerArea} onPress={openScanner}>
          <View style={styles.scannerFrame}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
            <Ionicons name="qr-code-outline" size={120} color="#111" />
          </View>
        </TouchableOpacity>

        {/* Your Cart Section */}
        <Text style={styles.cartTitle}>Your Cart</Text>

        {cart.length === 0 ? (
          <Text style={styles.emptyText}>Add your product by scanning!</Text>
        ) : (
          cart.map((item) => (
            <View key={item._id} style={styles.cartItem}>
              <View style={styles.cartLeft}>
                <Text style={styles.productName}>
                  {item.name} {item.weight}{item.weightUnit}
                </Text>
                <View style={styles.barcodeRow}>
                  <Ionicons name="barcode-outline" size={14} color="#666" />
                  <Text style={styles.barcode}>{item.barcode}</Text>
                </View>
              </View>
              <View style={styles.cartRight}>
                <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
                <Text style={styles.productUnits}>{item.quantity} Units</Text>
                <View style={styles.quantityButtons}>
                  <TouchableOpacity
                    style={styles.btnIncrease}
                    onPress={() => increaseQuantity(item._id)}
                  >
                    <Ionicons name="add" size={18} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.btnDecrease}
                    onPress={() => decreaseQuantity(item._id)}
                  >
                    <Ionicons name="remove" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}

        {/* Checkout Section */}
        <View style={styles.checkoutCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Net Weight</Text>
            <Text style={styles.summaryValue}>{netWeight.toFixed(2)} L</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Grand total</Text>
            <Text style={styles.totalValue}>${grandTotal.toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
            <Text style={styles.checkoutButtonText}>Checkout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Barcode Scanner */}
      <BarcodeScanner
        visible={showScanner}
        onScan={handleBarcodeScanned}
        onClose={() => setShowScanner(false)}
      />

      {/* Remove Product Confirmation Modal */}
      <DeleteConfirmationModal
        visible={showRemoveModal}
        onConfirm={confirmRemoveProduct}
        onCancel={() => {
          setShowRemoveModal(false);
          setProductToRemove(null);
        }}
        title="Are You Sure want to remove this Product from Cart?"
        buttonText="Remove"
      />
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
    backgroundColor: '#10b981',
    marginRight: wp(1.5),
  },
  badgeText: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    color: '#0A3B7C',
    letterSpacing: 0.5,
  },
  scannerArea: {
    alignItems: 'center',
    marginBottom: hp(3),
  },
  scannerFrame: {
    width: wp(60),
    height: wp(60),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#111',
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#111',
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#111',
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#111',
  },
  cartTitle: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#111',
    marginBottom: hp(1.5),
  },
  emptyText: {
    fontSize: moderateScale(14),
    color: '#999',
    textAlign: 'center',
    marginVertical: hp(3),
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: moderateScale(12),
    padding: wp(4),
    marginBottom: hp(1.5),
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cartLeft: {
    flex: 1,
  },
  productName: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#111',
    marginBottom: hp(0.5),
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
  cartRight: {
    alignItems: 'flex-end',
  },
  productPrice: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#111',
    marginBottom: hp(0.5),
  },
  productUnits: {
    fontSize: moderateScale(12),
    color: '#666',
    marginBottom: hp(0.8),
  },
  quantityButtons: {
    flexDirection: 'row',
    gap: wp(2),
  },
  btnIncrease: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDecrease: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutCard: {
    backgroundColor: '#D6E8FF',
    borderRadius: moderateScale(16),
    padding: wp(5),
    marginTop: hp(2),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(1.5),
  },
  summaryLabel: {
    fontSize: moderateScale(14),
    color: '#111',
  },
  summaryValue: {
    fontSize: moderateScale(14),
    color: '#111',
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(2),
  },
  totalLabel: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#111',
  },
  totalValue: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#111',
  },
  checkoutButton: {
    backgroundColor: '#123F7A',
    borderRadius: moderateScale(25),
    paddingVertical: hp(1.8),
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
});
