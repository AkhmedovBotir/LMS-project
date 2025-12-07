import { Tabs } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { Colors, theme } from '../../constants/Color';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function TabsLayout() {
  const { isDarkMode } = useTheme();
  
  const colors = isDarkMode ? Colors.dark : Colors.light;
  
  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primary.light,
          tabBarInactiveTintColor: colors.tabIconDefault,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopColor: isDarkMode ? '#333' : '#eee',
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Asosiy',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profil',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
