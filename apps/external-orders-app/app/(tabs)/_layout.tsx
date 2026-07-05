import { Tabs } from 'expo-router';
import { Theme } from '../../constants/Theme';
// import { Ionicons } from '@expo/vector-icons'; // Assuming we can use expo vector icons which comes with expo

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: Theme.colors.primary,
      tabBarInactiveTintColor: '#888',
      tabBarStyle: {
        backgroundColor: Theme.colors.surface,
        borderTopWidth: Theme.components.borderWidth,
        borderTopColor: Theme.colors.border,
      },
      headerStyle: {
        backgroundColor: Theme.colors.background,
        borderBottomWidth: Theme.components.borderWidth,
        borderBottomColor: Theme.colors.border,
      },
      headerTitleStyle: {
        fontFamily: Theme.typography.fontFamilyBold,
      }
    }}>
      <Tabs.Screen
        name="camera"
        options={{
          title: 'الالتقاط',
          // tabBarIcon: ({ color }) => <Ionicons name="camera" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'السجل',
          // tabBarIcon: ({ color }) => <Ionicons name="list" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
