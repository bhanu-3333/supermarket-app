import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from 'react-native-gifted-charts';
import api from '../../utils/api';
import { wp, hp, moderateScale } from '../../utils/responsive';

export default function YearlyCustomerScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [legend, setLegend] = useState([]);

  const colors = ['#A78BFA', '#3B82F6', '#FB923C', '#34D399'];

  useEffect(() => {
    fetchYearlyCustomers();
  }, []);

  const fetchYearlyCustomers = async () => {
    try {
      const { data } = await api.get('/admin/customers/yearly', {
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      if (data.success && data.data.customerGrowth) {
        const years = Object.keys(data.data.customerGrowth).sort();
        
        const bars = years.map((year, index) => ({
          value: data.data.customerGrowth[year],
          label: year,
          frontColor: colors[index % colors.length],
        }));

        const legendItems = years.map((year, index) => ({
          year,
          value: data.data.customerGrowth[year],
          color: colors[index % colors.length],
        }));

        setChartData(bars);
        setLegend(legendItems);
      }
    } catch (err) {
      console.error('Error fetching yearly customers:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.storeName}>{user?.storeName || 'Store'}</Text>
          <View style={styles.badge}>
            <View style={styles.dot} />
            <Text style={styles.badgeText}>ADMIN</Text>
          </View>
        </View>

        {/* Date Selector & Filter (Placeholder) */}
        <View style={styles.selectorRow}>
          <TouchableOpacity style={styles.dateSelector}>
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <Text style={styles.dateSelectorText}>Select date</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterIcon}>
            <Ionicons name="options-outline" size={24} color="#111" />
          </TouchableOpacity>
        </View>

        {/* Chart Title */}
        <Text style={styles.chartTitle}>Yearly Customer</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#123F7A" style={styles.loader} />
        ) : chartData.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No customer data available</Text>
          </View>
        ) : (
          <>
            {/* Bar Chart */}
            <View style={styles.chartContainer}>
              <BarChart
                data={chartData}
                width={wp(80)}
                height={hp(35)}
                barWidth={moderateScale(50)}
                spacing={moderateScale(30)}
                roundedTop
                roundedBottom
                hideRules
                xAxisThickness={0}
                yAxisThickness={0}
                yAxisTextStyle={{ color: '#9CA3AF', fontSize: moderateScale(10) }}
                noOfSections={4}
                maxValue={chartData.length > 0 ? Math.max(...chartData.map(d => d.value)) * 1.2 : 100}
                showGradient={false}
                backgroundColor="#F5F5F5"
              />
            </View>

            {/* Legend */}
            <View style={styles.legendContainer}>
              {legend.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <Text style={styles.legendYear}>{item.year}</Text>
                  <Text style={styles.legendValue}>{item.value}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={styles.bottomSpacer} />
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
  backButton: {
    padding: moderateScale(4),
    marginRight: wp(2),
  },
  storeName: {
    flex: 1,
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
  chartTitle: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: hp(2.5),
  },
  loader: {
    marginTop: hp(10),
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
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(16),
    padding: wp(4),
    marginBottom: hp(3),
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  legendContainer: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(16),
    padding: wp(5),
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  legendDot: {
    width: moderateScale(16),
    height: moderateScale(16),
    borderRadius: moderateScale(8),
    marginRight: wp(3),
  },
  legendYear: {
    flex: 1,
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#111827',
  },
  legendValue: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: '#111827',
  },
  bottomSpacer: {
    height: hp(2),
  },
});
