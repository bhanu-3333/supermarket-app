import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function AccountTypeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/images/top.png')}
        style={styles.topImage}
        resizeMode="contain"
      />
      <Image
        source={require('../../../assets/images/bottom.png')}
        style={styles.bottomImage}
        resizeMode="contain"
      />

      <View style={styles.content}>
        <Text style={styles.brandTitle}>SmartCart</Text>
        <Text style={styles.subtitle}>Choose Account Type</Text>

        <View style={styles.cardsContainer}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/(auth)/register-admin')}
          >
            <Text style={styles.cardIcon}>🏪</Text>
            <Text style={styles.cardTitle}>Register Supermarket</Text>
            <Text style={styles.cardDesc}>Create your store and manage inventory</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/(auth)/register-customer')}
          >
            <Text style={styles.cardIcon}>🛒</Text>
            <Text style={styles.cardTitle}>Join Supermarket</Text>
            <Text style={styles.cardDesc}>Shop with your store code</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.backLink}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.backLinkText}>ALREADY HAVE AN ACCOUNT? LOGIN</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F7FA' },
  topImage: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: width * 0.5,
    height: width * 0.5,
    opacity: 0.35,
  },
  bottomImage: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: width * 0.5,
    height: width * 0.5,
    opacity: 0.35,
  },
  content: { flex: 1, paddingHorizontal: width * 0.08, justifyContent: 'center' },
  brandTitle: {
    fontSize: Math.min(width * 0.1, 40),
    fontWeight: 'bold',
    color: '#0A3B7C',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 40,
  },
  cardsContainer: { gap: 20, marginBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardIcon: { fontSize: 48, marginBottom: 12 },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A3B7C',
    marginBottom: 8,
  },
  cardDesc: { fontSize: 14, color: '#666', textAlign: 'center' },
  backLink: { alignItems: 'center', marginTop: 20 },
  backLinkText: {
    color: '#123F7A',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
