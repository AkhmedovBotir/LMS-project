import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import SideMenu from '../../components/SideMenu';
import { fetchMyGroups } from '../../services/api/groups';
import { api } from '../../services/api/api';

const { width } = Dimensions.get('window');
const MENU_WIDTH = width * 0.8;

interface DashboardStats {
  totalStudents: number;
  totalGroups: number;
  totalCourses: number;
  activeGroups: number;
}

export default function Dashboard() {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuAnimation] = useState(new Animated.Value(-MENU_WIDTH));
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalGroups: 0,
    totalCourses: 0,
    activeGroups: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleMenuPress = () => {
    const toValue = isMenuOpen ? -MENU_WIDTH : 0;
    Animated.spring(menuAnimation, {
      toValue,
      useNativeDriver: true,
    }).start();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavigation = (route: string) => {
    setIsMenuOpen(false);
    if (route === 'login') {
      router.replace('/login');
    } else {
      router.push(route as any);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Guruhlar ma'lumotlarini olish
      const groupsResponse = await fetchMyGroups();
      const groups = groupsResponse.data;
      
      // Kurslar ma'lumotlarini olish
      const coursesResponse = await api.get('/mobile/employees/my-courses');
      const courses = coursesResponse.data.data;
      
      // O'quvchilar ma'lumotlarini olish
      const studentsResponse = await api.get('/mobile/employees/my-students');
      const students = studentsResponse.data.data;

      // Faol guruhlarni hisoblash
      const activeGroups = groups.filter(group => group.status === 'active').length;

      setStats({
        totalStudents: students.length,
        totalGroups: groups.length,
        totalCourses: courses.length,
        activeGroups
      });

    } catch (error) {
      console.error('Dashboard data loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#111827' : '#F3F4F6' }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F59E0B" />
          <Text style={[styles.loadingText, { color: isDarkMode ? '#D1D5DB' : '#4B5563' }]}>
            Ma'lumotlar yuklanmoqda...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#111827' : '#F3F4F6' }]}>
      <View style={[styles.header, { borderBottomColor: isDarkMode ? '#1F2937' : '#E5E7EB' }]}>
        <TouchableOpacity onPress={handleMenuPress} style={styles.menuButton}>
          <Ionicons
            name="menu"
            size={24}
            color={isDarkMode ? '#FFFFFF' : '#000000'}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
          Dashboard
        </Text>
        <TouchableOpacity
          style={styles.themeButton}
          onPress={toggleTheme}
        >
          <Ionicons
            name={isDarkMode ? 'sunny' : 'moon'}
            size={24}
            color="#000000"
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
            <View style={styles.statContent}>
              <View style={styles.statInfo}>
                <Text style={[styles.statValue, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                  {stats.totalStudents}
                </Text>
                <Text style={[styles.statLabel, { color: isDarkMode ? '#D1D5DB' : '#4B5563' }]}>
                  Jami o'quvchilar
                </Text>
              </View>
              <Ionicons name="people" size={40} color="#F59E0B" />
            </View>
          </View>

          <View style={[styles.statCard, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
            <View style={styles.statContent}>
              <View style={styles.statInfo}>
                <Text style={[styles.statValue, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                  {stats.totalGroups}
          </Text>
                <Text style={[styles.statLabel, { color: isDarkMode ? '#D1D5DB' : '#4B5563' }]}>
                  Jami guruhlar
          </Text>
              </View>
              <Ionicons name="school" size={40} color="#F59E0B" />
        </View>
      </View>

          <View style={[styles.statCard, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
            <View style={styles.statContent}>
              <View style={styles.statInfo}>
                <Text style={[styles.statValue, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                  {stats.totalCourses}
                </Text>
                <Text style={[styles.statLabel, { color: isDarkMode ? '#D1D5DB' : '#4B5563' }]}>
                  Jami kurslar
                </Text>
              </View>
              <Ionicons name="book" size={40} color="#F59E0B" />
            </View>
          </View>
        </View>
      </ScrollView>

      <SideMenu
        isOpen={isMenuOpen}
        onClose={handleMenuPress}
        menuAnimation={menuAnimation}
        activeRoute="dashboard"
        onMenuPress={handleNavigation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 40,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  themeButton: {
    backgroundColor: '#FFD700',
    padding: 8,
    borderRadius: 5,
  },
  menuButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  statsContainer: {
    padding: 16,
    gap: 16,
  },
  statCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
}); 