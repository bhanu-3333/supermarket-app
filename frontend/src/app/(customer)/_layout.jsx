import { Tabs } from 'expo-router';
import { Image } from 'react-native';

const icon = (blue, white) => ({ focused }) => (
  <Image
    source={focused ? blue : white}
    style={{ width: 24, height: 24, tintColor: focused ? undefined : '#888' }}
    resizeMode="contain"
  />
);

export default function CustomerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#123F7A',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: { height: 60, paddingBottom: 8 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Scan',
          tabBarIcon: icon(
            require('../../../assets/images/scan-blue.png'),
            require('../../../assets/images/scan-white.png')
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: icon(
            require('../../../assets/images/trolly.png'),
            require('../../../assets/images/trolly.png')
          ),
        }}
      />
    </Tabs>
  );
}
