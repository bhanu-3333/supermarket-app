import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { wp, hp, moderateScale } from '../../utils/responsive';

const BHIM = require('../../../assets/images/BHIM.png');
const PAYTM = require('../../../assets/images/paytm.png');
const UPI = require('../../../assets/images/UPI.png');
const GOOGLEPAY = require('../../../assets/images/google-pay.png');
const PHONEPE = require('../../../assets/images/phonepe.png');

export default function PaymentScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();

  const cart = params.cart ? JSON.parse(params.cart) : [];
  const total = parseFloat(params.total || 0);
  const weight = parseFloat(params.weight || 0);

  const goToSuccess = () => {
    router.push({
      pathname: '/(customer)/payment-success',
      params: { cart: params.cart, total: params.total, weight: params.weight },
    });
  };

  const SectionDivider = ({ title }) => (
    <View style={styles.dividerRow}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>{title}</Text>
      <View style={styles.dividerLine} />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={26} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>select payment method</Text>
        </View>

        {/* Bill Summary */}
        <View style={styles.billCard}>
          {cart.map((item, index) => (
            <View
              key={item._id}
              style={[styles.billRow, index !== cart.length - 1 && styles.billRowBorder]}
            >
              <View style={styles.billLeft}>
                <Text style={styles.billItemName}>{item.name}</Text>
                <Text style={styles.billItemUnit}>{item.quantity} × ${item.price.toFixed(2)}</Text>
              </View>
              <Text style={styles.billItemTotal}>${(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.billDivider} />
          <View style={styles.billRow}>
            <Text style={styles.billWeightLabel}>Net Weight</Text>
            <Text style={styles.billWeightValue}>{weight.toFixed(2)} L</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>

        {/* RECOMMENDED */}
        <SectionDivider title="RECOMMENDED" />
        <View style={styles.card}>
          <TouchableOpacity style={[styles.paymentOption, styles.paymentOptionBorder]} onPress={goToSuccess}>
            <View style={styles.paymentLeft}>
              <Image source={BHIM} style={styles.paymentImg} resizeMode="contain" />
              <Text style={styles.paymentText}>BHIM UPI</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.paymentOption, styles.paymentOptionBorder]} onPress={goToSuccess}>
            <View style={styles.paymentLeft}>
              <Image source={PAYTM} style={styles.paymentImg} resizeMode="contain" />
              <Text style={styles.paymentText}>Paytm UPI</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.paymentOption} onPress={goToSuccess}>
            <View style={styles.paymentLeft}>
              <Image source={UPI} style={styles.paymentImg} resizeMode="contain" />
              <Text style={styles.paymentText}>supermoney UPI</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* CARDS */}
        <SectionDivider title="CARDS" />
        <View style={styles.card}>
          <TouchableOpacity style={styles.paymentOption} onPress={goToSuccess}>
            <View style={styles.paymentLeft}>
              <View style={styles.iconBox}>
                <Ionicons name="card-outline" size={22} color="#444" />
              </View>
              <Text style={styles.paymentText}>Add credit or debit cards</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* PAY BY ANY UPI APP */}
        <SectionDivider title="PAY BY ANY UPI APP" />
        <View style={styles.card}>
          <TouchableOpacity style={[styles.paymentOption, styles.paymentOptionBorder]} onPress={goToSuccess}>
            <View style={styles.paymentLeft}>
              <Image source={GOOGLEPAY} style={styles.paymentImg} resizeMode="contain" />
              <Text style={styles.paymentText}>Google pay UPI</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.paymentOption, styles.paymentOptionBorder]} onPress={goToSuccess}>
            <View style={styles.paymentLeft}>
              <Image source={PHONEPE} style={styles.paymentImg} resizeMode="contain" />
              <Text style={styles.paymentText}>phonepe UPI</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.paymentOption} onPress={goToSuccess}>
            <View style={styles.paymentLeft}>
              <Image source={UPI} style={styles.paymentImg} resizeMode="contain" />
              <Text style={styles.paymentText}>Add new UPI ID</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5F5' },
  container: { flex: 1 },
  content: { padding: wp(5), paddingBottom: hp(12) },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2.5),
  },
  backButton: { marginRight: wp(3) },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#111',
  },
  billCard: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(16),
    padding: wp(4),
    marginBottom: hp(2),
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(0.8),
  },
  billRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  billLeft: { flex: 1 },
  billItemName: { fontSize: moderateScale(14), fontWeight: '600', color: '#111' },
  billItemUnit: { fontSize: moderateScale(12), color: '#888', marginTop: 2 },
  billItemTotal: { fontSize: moderateScale(14), fontWeight: '600', color: '#111' },
  billDivider: { height: 1, backgroundColor: '#eee', marginVertical: hp(0.8) },
  billWeightLabel: { fontSize: moderateScale(13), color: '#666' },
  billWeightValue: { fontSize: moderateScale(13), color: '#666' },
  grandTotalLabel: { fontSize: moderateScale(16), fontWeight: 'bold', color: '#111' },
  grandTotalValue: { fontSize: moderateScale(16), fontWeight: 'bold', color: '#123F7A' },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp(1.8),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    color: '#999',
    marginHorizontal: wp(3),
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(14),
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(1.6),
    paddingHorizontal: wp(4),
  },
  paymentOptionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentImg: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(8),
    marginRight: wp(3),
    borderWidth: 1,
    borderColor: '#eee',
  },
  iconBox: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  paymentText: {
    fontSize: moderateScale(15),
    color: '#111',
  },
});
