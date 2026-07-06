import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import SwipeButton from '../components/SwipeButton';
import { wp, hp, moderateScale, isTablet } from '../utils/responsive';

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);

  // Reset redirect flag when screen comes into focus (like after logout)
  useFocusEffect(
    useCallback(() => {
      console.log('WelcomeScreen: Screen focused, user=', user ? `${user.name} (${user.role})` : 'null');
      if (!user) {
        setHasRedirected(false);
      }
    }, [user])
  );

  useEffect(() => {
    console.log('WelcomeScreen: loading=', loading, 'user=', user ? `${user.name} (${user.role})` : 'null', 'hasRedirected=', hasRedirected);
    
    if (!loading) {
      if (user && !hasRedirected) {
        console.log('Redirecting authenticated user to role screen...');
        setHasRedirected(true);
        if (user.role === 'admin') router.replace('/(admin)');
        else if (user.role === 'staff') router.replace('/(staff)');
        else router.replace('/(customer)');
      } else if (!user) {
        // Reset redirect flag when user is logged out
        console.log('User logged out, resetting redirect flag...');
        setHasRedirected(false);
      }
    }
  }, [user, loading, hasRedirected, router]);

  // Show loading while checking auth
  if (loading) {
    console.log('WelcomeScreen: Showing loading state');
    return null;
  }

  // Show nothing while redirecting authenticated user
  if (user && !hasRedirected) {
    console.log('WelcomeScreen: Redirecting authenticated user...');
    return null;
  }

  // Show Welcome screen for unauthenticated users or after logout
  console.log('WelcomeScreen: Rendering Welcome screen');
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
