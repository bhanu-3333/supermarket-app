import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import SwipeButton from '../components/SwipeButton';
import { moderateScale } from '../utils/responsive';

const { width, height } = Dimensions.get('window');

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

  // Single diagonal blue shape — smaller size, positioned in middle
  parallelogram: {
    position: 'absolute',
    width: width * 1.4,
    height: height * 0.5,
    backgroundColor: '#4880C8',   // medium-dark blue
    top: height * 0.25,
    left: -width * 0.2,
    transform: [{ rotate: '-15deg' }],
    zIndex: 1,
  },

  // Text block — top of screen, more space
  textBlock: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: height * 0.08,
    paddingHorizontal: width * 0.08,
    alignItems: 'center',
    zIndex: 5,
    height: height * 0.25,
  },
  brand: {
    fontSize: moderateScale(42),
    fontWeight: 'bold',
    color: '#0A3B7C',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: moderateScale(19),
    fontWeight: '800',
    color: '#111',
    textAlign: 'center',
    marginBottom: 6,
  },
  description: {
    fontSize: moderateScale(13),
    color: '#444',
    textAlign: 'center',
    lineHeight: moderateScale(21),
  },

  // Trolley — larger size, positioned to give more space below for button
  trolley: {
    position: 'absolute',
    width: width * 1.0,
    height: width * 1.0,
    left: 0,
    top: height * 0.32,
    zIndex: 8,
  },

  // Swipe button — more space from bottom, reduced padding
  swipeWrap: {
    position: 'absolute',
    bottom: height * 0.08,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    zIndex: 10,
  },
});
