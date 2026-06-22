import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import SwipeButton from '../components/SwipeButton';
import { wp, hp, moderateScale, isTablet } from '../utils/responsive';

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect based on user role
  if (!loading && user) {
    if (user.role === 'admin') return <Redirect href="/(admin)" />;
    if (user.role === 'staff') return <Redirect href="/(staff)" />;
    return <Redirect href="/(customer)" />;
  }

  if (loading) return null;

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Diagonal blue background shape */}
      <View style={styles.backgroundShape} />

      <View style={styles.content}>
        <Text style={styles.brand}>SmartCart</Text>
        <Text style={styles.subtitle}>Scan. Shop. Skip the Line.</Text>
        <Text style={styles.description}>
          Lets you scan items, track your total, and enjoy{'\n'}fast, checkout-free shopping.
        </Text>

        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/images/trolly.png')}
            style={styles.trolley}
            resizeMode="contain"
          />
        </View>

        <View style={styles.swipeWrap}>
          <SwipeButton onSwipeSuccess={() => router.push('/(auth)/login')} />
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8EFF6',
  },
  backgroundShape: {
    position: 'absolute',
    bottom: 0,
    width: wp(100),
    height: hp(55),
    backgroundColor: '#5A92D4',
    top: hp(48),
    transform: [{ skewY: '-15deg' }],
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: hp(8),
    paddingHorizontal: wp(8),
    maxWidth: isTablet ? 600 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  brand: {
    fontSize: moderateScale(36),
    fontWeight: 'bold',
    color: '#0A3B7C',
    marginBottom: hp(1.2),
  },
  subtitle: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#111',
    textAlign: 'center',
    marginBottom: hp(1),
  },
  description: {
    fontSize: moderateScale(14),
    color: '#555',
    textAlign: 'center',
    lineHeight: moderateScale(21),
    marginBottom: hp(1.2),
    paddingHorizontal: wp(5),
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    zIndex: 10,
  },
  trolley: {
    width: wp(isTablet ? 50 : 85),
    height: wp(isTablet ? 50 : 85),
  },
  swipeWrap: {
    paddingBottom: hp(6),
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: wp(5),
  },
});
