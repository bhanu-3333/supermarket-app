import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { wp, hp, moderateScale } from '../../utils/responsive';

export default function PaymentScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();

  const paymentMethods = [
    { id: 'bhim', name: 'BHIM UPI', section: 'recommended' },
    { id: 'paytm', name: 'Paytm UPI', section: 'recommended' },
    { id: 'supermoney', name: 'supermoney UPI', section: 'recommended' },
    { id: 'card', name: 'Add credit or debit cards', section: 'cards' },
    { id: 'googlepay', name: 'Google pay UPI', section: 'upi' },
    { id: 'phonepe', name: 'phonepe UPI', section: 'upi' },
    { id: 'upi', name: 'Add new UPI ID', section: 'upi' },
  ];

  const handlePaymentSelect = (methodId) => {
    // Navigate to payment success (no real payment integration)
    router.push({
      pathname: '/(customer)/payment-success',
      params: {
        cart: params.cart,
        total: params.total,
        weight: params.weight,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>select payment method</Text>
        </View>

        {/* Recommended Section */}
        <Text style={styles.sectionTitle}>RECOMMENDED</Text>
        <View style={styles.card}>
          {paymentMethods
            .filter((m) => m.section === 'recommended')
            .map((method, index, arr) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentOption,
                  index !== arr.length - 1 && styles.paymentOptionBorder,
                ]}
                onPress={() => handlePaymentSelect(method.id)}
              >
                <View style={styles.paymentLeft}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="card-outline" size={24} color="#123F7A" />
                  </View>
                  <Text style={styles.paymentText}>{method.name}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            ))}
        </View>

        {/* Cards Section */}
        <Text style={styles.sectionTitle}>CARDS</Text>
        <View style={styles.card}>
          {paymentMethods
            .filter((m) => m.section === 'cards')
            .map((method) => (
              <TouchableOpacity
                key={method.id}
                style={styles.paymentOption}
                onPress={() => handlePaymentSelect(method.id)}
              >
                <View style={styles.paymentLeft}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="card-outline" size={24} color="#123F7A" />
                  </View>
                  <Text style={styles.paymentText}>{method.name}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            ))}
        </View>

        {/* UPI Section */}
        <Text style={styles.sectionTitle}>PAY BY ANY UPI APP</Text>
        <View style={styles.card}>
          {paymentMethods
            .filter((m) => m.section === 'upi')
            .map((method, index, arr) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentOption,
                  index !== arr.length - 1 && styles.paymentOptionBorder,
                ]}
                onPress={() => handlePaymentSelect(method.id)}
              >
                <View style={styles.paymentLeft}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="logo-google" size={24} color="#123F7A" />
                  </View>
                  <Text style={styles.paymentText}>{method.name}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            ))}
        </View>
      </ScrollView>
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
    alignItems: 'center',
    marginBottom: hp(3),
  },
  backButton: {
    marginRight: wp(3),
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#111',
  },
  sectionTitle: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#999',
    marginTop: hp(2),
    marginBottom: hp(1.5),
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(16),
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(4),
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
  iconCircle: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  paymentText: {
    fontSize: moderateScale(16),
    color: '#111',
  },
});
