import { Tabs } from 'expo-router';
import { Image } from 'react-native';

const icon = (blue, white) => ({ focused }) => (
  <Image
    source={focused ? blue : white}
    style={{ width: 24, height: 24, tintColor: focused ? undefined : '#888' }}
    resizeMode="contain"
  />
);

export default function AdminLayout() {
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
          title: 'Dashboard',
          tabBarIcon: icon(
            require('../../../assets/images/dashboard-blue.png'),
            require('../../../assets/images/dashboard-white.png')
          ),
        }}
      />
      <Tabs.Screen
        name="stock"
        options={{
          title: 'Stock',
          tabBarIcon: icon(
            require('../../../assets/images/stock-blue.png'),
            require('../../../assets/images/stock-white.png')
          ),
        }}
      />
      <Tabs.Screen
        name="sales"
        options={{
          title: 'Sales',
          tabBarIcon: icon(
            require('../../../assets/images/sales-blue.png'),
            require('../../../assets/images/sales-white.png')
          ),
        }}
      />
      <Tabs.Screen
        name="logs"
        options={{
          title: 'Logs',
          tabBarIcon: icon(
            require('../../../assets/images/log-blue.png'),
            require('../../../assets/images/log-white.png')
          ),
        }}
      />
    </Tabs>
  );
}
