import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { wp, hp, moderateScale, isSmallDevice, isTablet } from '../../utils/responsive';

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
    top: hp(-8),
    right: wp(-15),
    width: wp(50),
    height: wp(50),
    opacity: 0.35,
  },
  bottomImage: {
    position: 'absolute',
    bottom: hp(-8),
    left: wp(-15),
    width: wp(50),
    height: wp(50),
    opacity: 0.35,
  },
  content: { 
    flex: 1, 
    paddingHorizontal: wp(8), 
    justifyContent: 'center',
    maxWidth: isTablet ? 500 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  brandTitle: {
    fontSize: moderateScale(isSmallDevice ? 32 : 40),
    fontWeight: 'bold',
    color: '#0A3B7C',
    textAlign: 'center',
    marginBottom: hp(isSmallDevice ? 1 : 1.5),
  },
  subtitle: {
    fontSize: moderateScale(isSmallDevice ? 16 : 18),
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: hp(isSmallDevice ? 4 : 5),
  },
  cardsContainer: { 
    gap: hp(2.5), 
    marginBottom: hp(isSmallDevice ? 4 : 5) 
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(20),
    padding: wp(6),
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardIcon: { 
    fontSize: moderateScale(isSmallDevice ? 40 : 48), 
    marginBottom: hp(1.5) 
  },
  cardTitle: {
    fontSize: moderateScale(isSmallDevice ? 16 : 18),
    fontWeight: 'bold',
    color: '#0A3B7C',
    marginBottom: hp(1),
    textAlign: 'center',
  },
  cardDesc: { 
    fontSize: moderateScale(isSmallDevice ? 12 : 14), 
    color: '#666', 
    textAlign: 'center',
    paddingHorizontal: wp(2),
  },
  backLink: { 
    alignItems: 'center', 
    marginTop: hp(2),
    paddingBottom: hp(3),
  },
  backLinkText: {
    color: '#123F7A',
    fontSize: moderateScale(isSmallDevice ? 10 : 12),
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
