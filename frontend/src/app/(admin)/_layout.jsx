import { Tabs } from 'expo-router';
import { useTabBarConfig, createTabIcon } from '../../utils/tabBarConfig';

export default function AdminLayout() {
  const tabBarConfig = useTabBarConfig();
  
  return (
    <Tabs screenOptions={tabBarConfig}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: createTabIcon(
            require('../../../assets/images/dashboard-blue.png'),
            require('../../../assets/images/dashboard-white.png')
          ),
        }}
      />
      <Tabs.Screen
        name="stock"
        options={{
          title: 'Stock',
          tabBarIcon: createTabIcon(
            require('../../../assets/images/stock-blue.png'),
            require('../../../assets/images/stock-white.png')
          ),
        }}
      />
      <Tabs.Screen
        name="sales"
        options={{
          title: 'Sales',
          tabBarIcon: createTabIcon(
            require('../../../assets/images/sales-blue.png'),
            require('../../../assets/images/sales-white.png')
          ),
        }}
      />
      <Tabs.Screen
        name="logs"
        options={{
          title: 'Logs',
          tabBarIcon: createTabIcon(
            require('../../../assets/images/log-blue.png'),
            require('../../../assets/images/log-white.png')
          ),
        }}
      />
      <Tabs.Screen
        name="staff-management"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="identity-portal"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
