import { Tabs } from 'expo-router';
import { Image, Platform } from 'react-native';

const icon = (blue, white) => ({ focused }) => (
  <Image
    source={focused ? blue : white}
    style={{ 
      width: 24, 
      height: 24, 
      tintColor: focused ? undefined : '#888' 
    }}
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
        tabBarStyle: { 
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 25 : 8,
          paddingTop: 8,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: -4,
        },
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
      <Tabs.Screen
        name="staff-management"
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="identity-portal"
        options={{
          tabBarButton: () => null,
        }}
      />
    </Tabs>
  );
}
