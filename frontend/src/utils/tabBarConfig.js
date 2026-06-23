import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Production-Quality Bottom Tab Bar Configuration
 * Shared across Admin, Staff, and Customer layouts
 */
export const useTabBarConfig = () => {
  const insets = useSafeAreaInsets();
  
  // Calculate proper heights
  const TAB_BAR_HEIGHT = 65;
  const SAFE_AREA_PADDING = Math.max(insets.bottom, 10);
  const TOTAL_HEIGHT = TAB_BAR_HEIGHT + SAFE_AREA_PADDING;

  return {
    headerShown: false,
    tabBarActiveTintColor: '#123F7A',
    tabBarInactiveTintColor: '#9CA3AF',
    tabBarStyle: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: TOTAL_HEIGHT,
      backgroundColor: '#FFFFFF',
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
      paddingBottom: SAFE_AREA_PADDING,
      paddingTop: 8,
      paddingHorizontal: 0,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: '500',
      marginTop: 4,
      marginBottom: 0,
    },
    tabBarIconStyle: {
      marginTop: 0,
      marginBottom: 0,
    },
    tabBarItemStyle: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 4,
      paddingHorizontal: 0,
    },
    tabBarAllowFontScaling: false,
  };
};

/**
 * Tab Icon Component - Returns properly sized icons
 */
export const createTabIcon = (blueImage, whiteImage) => ({ focused }) => {
  const { Image } = require('react-native');
  
  return (
    <Image
      source={focused ? blueImage : whiteImage}
      style={{ 
        width: 24, 
        height: 24,
        resizeMode: 'contain',
        tintColor: focused ? '#123F7A' : '#9CA3AF',
      }}
    />
  );
};
