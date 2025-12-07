import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const MENU_WIDTH = width * 0.8;

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menuAnimation: Animated.Value;
  activeRoute?: string;
  onMenuPress?: (route: string) => void;
}

type IconName = keyof typeof Ionicons.glyphMap;

interface MenuItem {
  id: string;
  label: string;
  icon: IconName;
  activeIcon: IconName;
  route: string;
}

export default function SideMenu({ isOpen, onClose, menuAnimation, activeRoute = 'dashboard', onMenuPress }: SideMenuProps) {
  const { isDarkMode } = useTheme();

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'grid-outline',
      activeIcon: 'grid',
      route: 'dashboard'
    },
    {
      id: 'courses',
      label: 'Kurslar',
      icon: 'book-outline',
      activeIcon: 'book',
      route: 'courses'
    },
    {
      id: 'topics',
      label: 'Mavzular',
      icon: 'earth-outline',
      activeIcon: 'book',
      route: 'topics'
    },
    {
      id: 'groups',
      label: 'Guruhlar',
      icon: 'people-outline',
      activeIcon: 'people',
      route: 'groups'
    },
    {
      id: 'students',
      label: "O'quvchilar",
      icon: 'school-outline',
      activeIcon: 'school',
      route: 'students'
    },
    {
      id: 'attendance',
      label: 'Davomat',
      icon: 'checkmark-circle-outline',
      activeIcon: 'checkmark-circle',
      route: 'attendance'
    },
    {
      id: 'grades',
      label: 'Baxolar',
      icon: 'bar-chart-outline',
      activeIcon: 'bar-chart',
      route: 'grades'
    },
    {
      id: 'course-material',
      label: 'Kurs Materiallari',
      icon: 'book-outline',
      activeIcon: 'book',
      route: 'course-material'
    },
  ];

  const handleMenuPress = (route: string) => {
    router.push(route as any);
      onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        />
      )}

      {/* Menu */}
      <Animated.View
        style={[
          styles.menu,
          {
            backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
            transform: [{ translateX: menuAnimation }],
          },
        ]}
      >
        <View style={styles.menuHeader}>
          <Text style={[styles.menuTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
            Menu
          </Text>
        </View>

        <View style={styles.menuContent}>
          {menuItems.map((item) => {
            const isActive = activeRoute === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  isActive && styles.menuItemActive,
                  { backgroundColor: isActive ? (isDarkMode ? '#374151' : '#F3F4F6') : 'transparent' }
                ]}
                onPress={() => handleMenuPress(item.route)}
              >
                <Ionicons
                  name={isActive ? item.activeIcon : item.icon}
                  size={24}
                  color={isActive ? '#FFD700' : (isDarkMode ? '#FFFFFF' : '#000000')}
                />
                <Text
                  style={[
                    styles.menuItemText,
                    { color: isActive ? '#FFD700' : (isDarkMode ? '#FFFFFF' : '#000000') }
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.menuFooter}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={() => handleMenuPress('login')}
          >
            <Ionicons
              name="log-out-outline"
              size={24}
              color={isDarkMode ? '#000000' : '#000000'}
            />
            <Text style={[styles.logoutText, { color: isDarkMode ? '#000000' : '#000000' }]}>
              Chiqish
            </Text>
          </TouchableOpacity>

          <View style={styles.footerInfo}>
            <Text style={[styles.versionText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
              Version 1.0.0
            </Text>
            <Text style={[styles.copyrightText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
              © Sarget Academy
            </Text>
          </View>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menu: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: MENU_WIDTH,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuHeader: {
    padding: 16,
    paddingTop: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  menuContent: {
    flex: 1,
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  menuItemActive: {
    borderLeftWidth: 3,
    borderLeftColor: '#FFD700',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  menuFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  logoutText: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  footerInfo: {
    marginTop: 10,
    marginBottom: 35,
    justifyContent: 'space-around',
    flexDirection: 'row',
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
  },
  copyrightText: {
    fontSize: 12,
  },
}); 