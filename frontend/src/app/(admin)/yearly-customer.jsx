import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from 'react-native-gifted-charts';
import api from '../../utils/api';
import { wp, hp, moderateScale } from '../../utils/responsive';

const COLORS = ['#A78BFA', '#3B82F6', '#FB923C', '#34D399'];
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function CalendarPicker({ visible, onClose, onFilter }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState(today.getDate());

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.calendarBox} activeOpacity={1} onPress={() => {}}>
          <View style={styles.calMonthRow}>
            <TouchableOpacity onPress={prevMonth} style={styles.calArrow}>
              <Ionicons name="chevron-back" size={20} color="#555" />
            </TouchableOpacity>
            <Text style={styles.calMonthText}>{MONTHS[viewMonth]} {viewYear}</Text>
            <TouchableOpacity onPress={nextMonth} style={styles.calArrow}>
              <Ionicons name="chevron-forward" size={20} color="#555" />
            </TouchableOpacity>
          </View>
          <View style={styles.calDaysRow}>
            {DAYS.map(d => <Text key={d} style={styles.calDayLabel}>{d}</Text>)}
          </View>
          <View style={styles.calGrid}>
            {cells.map((day, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.calCell, day === selected && styles.calCellSelected]}
                onPress={() => day && setSelected(day)}
                disabled={!day}
              >
                <Text style={[styles.calCellText, day === selected && styles.calCellTextSelected]}>
                  {day || ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.filterBtn} onPress={() => { onFilter(new Date(viewYear, viewMonth, selected)); onClose(); }}>
            <Text style={styles.filterBtnText}>Filter</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

function FilterModal({ visible, onClose, onApply }) {
  const [sales, setSales] = useState('');
  const [customer, setCustomer] = useState('');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.filterBox} activeOpacity={1} onPress={() => {}}>
          <Text style={styles.filterSectionTitle}>Sales</Text>
          {[{ label: 'Yearly sales', val: 'yearly' }, { label: 'Monthly sales', val: 'monthly' }, { label: 'Today sales', val: 'today' }].map(o => (
            <TouchableOpacity key={o.val} style={styles.filterRow} onPress={() => { setSales(o.val); setCustomer(''); }}>
              <Text style={styles.filterRowText}>{o.label}</Text>
              <View style={[styles.checkbox, sales === o.val && styles.checkboxActive]}>
                {sales === o.val && <Ionicons name="checkmark" size={14} color="#123F7A" />}
              </View>
            </TouchableOpacity>
          ))}
          <Text style={[styles.filterSectionTitle, { marginTop: hp(1.5) }]}>Customer</Text>
          {[{ label: 'Yearly customer', val: 'yearly' }, { label: 'Monthly customer', val: 'monthly' }, { label: 'Today customer', val: 'today' }].map(o => (
            <TouchableOpacity key={o.val} style={styles.filterRow} onPress={() => { setCustomer(o.val); setSales(''); }}>
              <Text style={styles.filterRowText}>{o.label}</Text>
              <View style={[styles.checkbox, customer === o.val && styles.checkboxActive]}>
                {customer === o.val && <Ionicons name="checkmark" size={14} color="#123F7A" />}
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.filterBtn} onPress={() => { onApply({ sales, customer }); onClose(); }}>
            <Text style={styles.filterBtnText}>Filter</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

export default function YearlyCustomerScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [legend, setLegend] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => { fetchYearlyCustomers(); }, []);

  const fetchYearlyCustomers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/customers/yearly', {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (data.success && data.data.customerGrowth) {
        const years = Object.keys(data.data.customerGrowth).sort();
        setChartData(years.map((y, i) => ({ value: data.data.customerGrowth[y], label: y, frontColor: COLORS[i % COLORS.length] })));
        setLegend(years.map((y, i) => ({ year: y, value: data.data.customerGrowth[y], color: COLORS[i % COLORS.length] })));
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleFilter = ({ sales, customer }) => {
    if (sales === 'yearly') router.replace('/(admin)/yearly-sales');
    if (sales === 'monthly' || sales === 'today') router.replace('/(admin)/sales');
    if (customer === 'yearly') return; // already here
    if (customer === 'monthly' || customer === 'today') router.replace('/(admin)/sales');
  };

  const maxVal = chartData.length > 0 ? Math.max(...chartData.map(d => d.value)) * 1.25 : 100;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
          <TouchableOpacity style={styles.dateSelector} onPress={() => setShowCalendar(true)}>
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <Text style={styles.dateSelectorText}>Select date</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterIcon} onPress={() => setShowFilter(true)}>
            <Ionicons name="options-outline" size={24} color="#111" />
          </TouchableOpacity>
        </View>

        {/* Chart Card */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Yearly Customer</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#123F7A" style={styles.loader} />
          ) : chartData.length === 0 ? (
            <Text style={styles.emptyText}>No customer data available</Text>
          ) : (
            <View style={{ overflow: 'hidden' }}>
              <BarChart
                data={chartData}
                width={wp(72)}
                height={hp(28)}
                barWidth={wp(10)}
                spacing={wp(8)}
                roundedTop
                hideRules={false}
                rulesType="dashed"
                rulesColor="#e5e7eb"
                xAxisThickness={0}
                yAxisThickness={0}
                yAxisTextStyle={{ color: '#9CA3AF', fontSize: moderateScale(9) }}
                noOfSections={3}
                maxValue={maxVal}
                backgroundColor="#fff"
                barBorderRadius={4}
              />
            </View>
          )}
        </View>

        {/* Legend */}
        {legend.length > 0 && (
          <View style={styles.legendCard}>
            {legend.map((item, i) => (
              <View key={i} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={styles.legendYear}>{item.year}</Text>
                <Text style={styles.legendValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <CalendarPicker visible={showCalendar} onClose={() => setShowCalendar(false)} onFilter={() => {}} />
      <FilterModal visible={showFilter} onClose={() => setShowFilter(false)} onApply={handleFilter} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5F5' },
  container: { flex: 1 },
  content: { paddingHorizontal: wp(5), paddingTop: hp(2), paddingBottom: hp(15) },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: hp(2.5) },
  storeName: { fontSize: moderateScale(26), fontWeight: 'bold', color: '#0A3B7C' },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F4FD', borderRadius: moderateScale(20), paddingHorizontal: wp(3), paddingVertical: hp(0.8) },
  dot: { width: moderateScale(8), height: moderateScale(8), borderRadius: moderateScale(4), backgroundColor: '#22c55e', marginRight: wp(1.5) },
  badgeText: { fontSize: moderateScale(11), fontWeight: '700', color: '#0A3B7C', letterSpacing: 0.5 },
  selectorRow: { flexDirection: 'row', gap: wp(3), marginBottom: hp(2.5) },
  dateSelector: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: moderateScale(25), paddingHorizontal: wp(4), paddingVertical: hp(1.5), gap: wp(2), elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  dateSelectorText: { fontSize: moderateScale(14), color: '#666' },
  filterIcon: { width: wp(12), justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', borderRadius: moderateScale(12), elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  chartCard: { backgroundColor: '#fff', borderRadius: moderateScale(16), padding: wp(4), marginBottom: hp(2), elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, overflow: 'hidden' },
  chartTitle: { fontSize: moderateScale(15), fontWeight: 'bold', color: '#111827', marginBottom: hp(2) },
  loader: { marginVertical: hp(5) },
  emptyText: { color: '#9ca3af', fontSize: moderateScale(14), textAlign: 'center', paddingVertical: hp(3) },
  legendCard: { backgroundColor: '#fff', borderRadius: moderateScale(16), padding: wp(4), elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  legendItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: hp(1) },
  legendDot: { width: moderateScale(12), height: moderateScale(12), borderRadius: moderateScale(6), marginRight: wp(2.5) },
  legendYear: { flex: 1, fontSize: moderateScale(14), fontWeight: '600', color: '#111827' },
  legendValue: { fontSize: moderateScale(14), fontWeight: 'bold', color: '#111827' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  calendarBox: { backgroundColor: '#fff', borderRadius: moderateScale(16), padding: wp(5), width: wp(88) },
  calMonthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: hp(2) },
  calArrow: { padding: wp(2) },
  calMonthText: { fontSize: moderateScale(16), fontWeight: '600', color: '#111' },
  calDaysRow: { flexDirection: 'row', marginBottom: hp(1) },
  calDayLabel: { flex: 1, textAlign: 'center', fontSize: moderateScale(11), color: '#9ca3af', fontWeight: '600' },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: { width: `${100 / 7}%`, aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRadius: moderateScale(20) },
  calCellSelected: { backgroundColor: '#123F7A' },
  calCellText: { fontSize: moderateScale(14), color: '#111' },
  calCellTextSelected: { color: '#fff', fontWeight: 'bold' },
  filterBox: { backgroundColor: '#fff', borderRadius: moderateScale(16), padding: wp(6), width: wp(80) },
  filterSectionTitle: { fontSize: moderateScale(16), fontWeight: 'bold', color: '#111', marginBottom: hp(1) },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: hp(1.1) },
  filterRowText: { fontSize: moderateScale(14), color: '#6b7280' },
  checkbox: { width: moderateScale(20), height: moderateScale(20), borderWidth: 1.5, borderColor: '#ccc', borderRadius: moderateScale(4), justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { borderColor: '#123F7A' },
  filterBtn: { backgroundColor: '#123F7A', borderRadius: moderateScale(25), paddingVertical: hp(1.6), alignItems: 'center', marginTop: hp(2.5) },
  filterBtnText: { color: '#fff', fontSize: moderateScale(15), fontWeight: '600' },
});
