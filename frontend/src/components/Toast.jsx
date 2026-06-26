import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { wp, hp, moderateScale } from '../utils/responsive';

export default function Toast({ visible, message, description, type = 'success', onHide, duration = 3000 }) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide in and fade in
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timeout = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (onHide) onHide();
        });
      }, duration);

      return () => clearTimeout(timeout);
    }
  }, [visible, duration]);

  if (!visible) return null;

  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#123F7A',
          icon: 'checkmark-circle',
          iconColor: '#fff',
        };
      case 'error':
        return {
          backgroundColor: '#ef4444',
          icon: 'close-circle',
          iconColor: '#fff',
        };
      case 'warning':
        return {
          backgroundColor: '#f59e0b',
          icon: 'warning',
          iconColor: '#fff',
        };
      case 'info':
        return {
          backgroundColor: '#3b82f6',
          icon: 'information-circle',
          iconColor: '#fff',
        };
      default:
        return {
          backgroundColor: '#123F7A',
          icon: 'checkmark-circle',
          iconColor: '#fff',
        };
    }
  };

  const config = getConfig();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Ionicons name={config.icon} size={24} color={config.iconColor} />
      <View style={styles.textContainer}>
        <Text style={styles.message}>{message}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: hp(6),
    left: wp(5),
    right: wp(5),
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: wp(3),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.8),
    borderRadius: moderateScale(12),
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 9999,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    color: '#fff',
    fontSize: moderateScale(15),
    fontWeight: '600',
    lineHeight: moderateScale(20),
  },
  description: {
    color: '#fff',
    fontSize: moderateScale(13),
    opacity: 0.9,
    marginTop: hp(0.3),
    lineHeight: moderateScale(18),
  },
});
