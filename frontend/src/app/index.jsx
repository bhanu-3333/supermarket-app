import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import SwipeButton from '../components/SwipeButton';
import { moderateScale } from '../utils/responsive';

const { width, height } = Dimensions.get('window');

// Layout constants
const TOP_HEIGHT = height * 0.33;      // light section height
const BOTTOM_HEIGHT = height * 0.67;   // blue section height
const TROLLEY_SIZE = width * 0.88;
const TROLLEY_TOP = height * 0.25;     // trolley starts here (overlaps the split)

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') router.replace('/(admin)');
      else if (user.role === 'staff') router.replace('/(staff)');
      else router.replace('/(customer)');
    }
  }, [user, loading]);

  if (loading || user) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      {/* ── Light blue top ── */}
      <View style={styles.topBg} />

      {/* ── Dark blue bottom with diagonal top edge ── */}
      <View style={styles.bottomBg} />

      {/* ── Text content (sits in the light section) ── */}
      <View style={styles.textBlock}>
        <Text style={styles.brand}>SmartCart</Text>
        <Text style={styles.subtitle}>Scan. Shop. Skip the Line.</Text>
        <Text style={styles.description}>
          Lets you scan items, track your total, and enjoy{'\n'}fast, checkout-free shopping.
        </Text>
      </View>

      {/* ── Trolley (overlaps the divider) ── */}
      <Image
        source={require('../../assets/images/trolly.png')}
        style={styles.trolley}
        resizeMode="contain"
      />

      {/* ── Swipe button ── */}
      <View style={styles.swipeWrap}>
        <SwipeButton onSwipeSuccess={() => router.push('/(auth)/login')} label="Swipe now" />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#C8DFF0',
  },

  // Light blue top panel
  topBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: TOP_HEIGHT + 60,          // extra so diagonal doesn't show gap
    backgroundColor: '#C8DFF0',
  },

  // Darker blue bottom — uses a large border-radius on top to fake the diagonal curve
  bottomBg: {
    position: 'absolute',
    bottom: 0,
    left: -width * 0.15,
    right: -width * 0.15,
    top: TOP_HEIGHT - 20,
    backgroundColor: '#3D7CC9',
    borderTopLeftRadius: width,
    borderTopRightRadius: width,
  },

  // Text sits at the top
  textBlock: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: TOP_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: height * 0.06,
    paddingHorizontal: width * 0.1,
    zIndex: 2,
  },
  brand: {
    fontSize: moderateScale(38),
    fontWeight: 'bold',
    color: '#0A3B7C',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    color: '#111',
    textAlign: 'center',
    marginBottom: 6,
  },
  description: {
    fontSize: moderateScale(13),
    color: '#444',
    textAlign: 'center',
    lineHeight: moderateScale(20),
  },

  // Trolley image spanning the colour split
  trolley: {
    position: 'absolute',
    top: TROLLEY_TOP,
    left: (width - TROLLEY_SIZE) / 2,
    width: TROLLEY_SIZE,
    height: TROLLEY_SIZE,
    zIndex: 5,
  },

  // Swipe button pinned to the bottom
  swipeWrap: {
    position: 'absolute',
    bottom: height * 0.05,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: width * 0.08,
    zIndex: 10,
  },
});
