import { Tabs } from 'expo-router';
import { useTabBarConfig, createTabIcon } from '../../utils/tabBarConfig';

export default function StaffLayout() {
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
        name="add"
        options={{
          title: 'Add',
          tabBarIcon: createTabIcon(
            require('../../../assets/images/add-blue.png'),
            require('../../../assets/images/add-white.png')
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
    </Tabs>
  );
}
