import { Tabs } from 'expo-router';
import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function TabsLayout() {
  const { isDarkMode } = useTheme();

  return (
    <Tabs screenOptions={{ 
      headerShown: false, 
      tabBarStyle: { display: 'none' }
    }}>
      <Tabs.Screen 
        name="dashboard" 
        options={{
          href: '/dashboard',
        }}
      />
      <Tabs.Screen 
        name="courses" 
        options={{
          href: '/courses',
        }}
      />
      <Tabs.Screen 
        name="groups" 
        options={{
          href: '/groups',
        }}
      />
      <Tabs.Screen 
        name="students" 
        options={{
          href: '/students',
        }}
      />
      <Tabs.Screen 
        name="attendance" 
        options={{
          href: '/attendance',
        }}
      />
      <Tabs.Screen 
        name="topics" 
        options={{
          href: '/topics',
        }}
      />
      <Tabs.Screen 
        name="grades" 
        options={{
          href: '/grades',
        }}
      />
      <Tabs.Screen 
        name="course-material" 
        options={{
          href: '/course-material/index',
        }}
      />
    </Tabs>
  );
}
