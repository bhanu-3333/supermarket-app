import { Tabs } from 'expo-router';
import { useTabBarConfig, createTabIcon } from '../../utils/tabBarConfig';

export default function CustomerLayout() {
  const tabBarConfig = useTabBarConfig();
  
  return (
    <Tabs screenOptions={tabBarConfig}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Scan',
          tabBarIcon: createTabIcon(
            require('../../../assets/images/scan-blue.png'),
            require('../../../assets/images/scan-white.png')
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Logs',
          tabBarIcon: createTabIcon(
            require('../../../assets/images/log-blue.png'),
            require('../../../assets/images/log-white.png')
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="payment"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="payment-success"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="order-summary"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="order-details"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
