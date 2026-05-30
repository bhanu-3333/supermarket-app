import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import SwipeButton from '../components/SwipeButton';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') router.replace('/(admin)/index');
      else if (user.role === 'staff') router.replace('/(staff)/index');
      else router.replace('/(customer)/index');
    }
  }, [user, loading]);

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
    width: width,
    height: height * 0.55,
    backgroundColor: '#5A92D4',
    top: height * 0.48,
    transform: [{ skewY: '-15deg' }],
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 70,
    paddingHorizontal: 30,
  },
  brand: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0A3B7C',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 10,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    zIndex: 10,
  },
  trolley: {
    width: width * 0.85,
    height: width * 0.85,
  },
  swipeWrap: {
    paddingBottom: 50,
    width: '100%',
    alignItems: 'center',
  },
});
