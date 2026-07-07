import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import SwipeButton from '../components/SwipeButton';
import { moderateScale, wp, hp, verticalScale, isSmallDevice } from '../utils/responsive';

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    if (!loading && !initialCheckDone) {
      setInitialCheckDone(true);
      if (user) {
        if (user.role === 'admin') router.replace('/(admin)');
        else if (user.role === 'staff') router.replace('/(staff)');
        else router.replace('/(customer)');
      }
    }
  }, [loading]);

  if (loading) return null;
  if (!initialCheckDone && user) return null;

  return (
    <GestureHandlerRootView style={styles.root}>

      {/* Full light blue background */}
      <View style={StyleSheet.absoluteFill} />

      {/* The diagonal blue parallelogram — goes from mid-left to lower-right */}
      <View style={styles.parallelogram} />

      {/* Text at top */}
      <View style={styles.textBlock}>
        <Text style={styles.brand}>SmartCart</Text>
        <Text style={styles.subtitle}>Scan. Shop. Skip the Line.</Text>
        <Text style={styles.description}>
          Lets you scan items, track your total, and enjoy{'\n'}fast, checkout-free shopping.
        </Text>
      </View>

      {/* Trolley — large, centered */}
      <Image
        source={require('../../assets/images/trolly.png')}
        style={styles.trolley}
        resizeMode="contain"
      />

      {/* Swipe button */}
      <View style={styles.swipeWrap}>
        <SwipeButton onSwipeSuccess={() => router.push('/(auth)/login')} label="Swipe now" />
      </View>

    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#C8DDF0',   // light blue base
  },

  // Single diagonal blue shape — responsive for all screen sizes
  parallelogram: {
    position: 'absolute',
    width: wp(140),
    height: hp(isSmallDevice ? 45 : 50),
    backgroundColor: '#4880C8',   // medium-dark blue
    top: hp(isSmallDevice ? 22 : 25),
    left: wp(-20),
    transform: [{ rotate: '-15deg' }],
    zIndex: 1,
  },

  // Text block — more space at top, smaller height
  textBlock: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: hp(isSmallDevice ? 10 : 12),
    paddingHorizontal: wp(8),
    alignItems: 'center',
    zIndex: 5,
    height: hp(isSmallDevice ? 20 : 22),
  },
  brand: {
    fontSize: moderateScale(isSmallDevice ? 36 : 42),
    fontWeight: 'bold',
    color: '#0A3B7C',
    marginBottom: verticalScale(6),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: moderateScale(isSmallDevice ? 16 : 19),
    fontWeight: '800',
    color: '#111',
    textAlign: 'center',
    marginBottom: verticalScale(6),
  },
  description: {
    fontSize: moderateScale(isSmallDevice ? 11 : 13),
    color: '#444',
    textAlign: 'center',
    lineHeight: moderateScale(isSmallDevice ? 18 : 21),
    paddingHorizontal: wp(2),
  },

  // Trolley — bigger size, moved up higher
  trolley: {
    position: 'absolute',
    width: wp(isSmallDevice ? 110 : 120),
    height: wp(isSmallDevice ? 110 : 120),
    left: wp(isSmallDevice ? -5 : -10),
    top: hp(isSmallDevice ? 30 : 32),
    zIndex: 8,
  },

  // Swipe button — closer to trolley, less bottom space
  swipeWrap: {
    position: 'absolute',
    bottom: hp(isSmallDevice ? 4 : 5),
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: wp(5),
    zIndex: 10,
  },
});
