import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import SideMenu from '../../../components/SideMenu';
import { useTheme } from '../../../context/ThemeContext';
import { fetchMyCourses } from '../../../services/api';
import { Course } from '../../../types/course';

const { width } = Dimensions.get('window');
const MENU_WIDTH = width * 0.8;

export default function CoursesScreen() {
  const { isDarkMode } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const menuAnimation = useRef(new Animated.Value(-MENU_WIDTH)).current;

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    Animated.spring(menuAnimation, {
      toValue: isMenuOpen ? 0 : -MENU_WIDTH,
      useNativeDriver: true,
    }).start();
  }, [isMenuOpen]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchMyCourses();
      if (response.success) {
        setCourses(response.data);
      } else {
        setError('Kurslarni yuklashda xatolik yuz berdi');
      }
    } catch (err) {
      setError('Kurslarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (route: string) => {
    setIsMenuOpen(false);
    if (route === 'login') {
      router.replace('/login');
    } else {
      router.push(route as any);
    }
  };

  const handleCoursePress = (courseId: string) => {
    router.push({
      pathname: '/topics/[courseId]',
      params: { courseId },
    });
  };

  const renderCourseItem = ({ item }: { item: Course }) => (
    <TouchableOpacity
      style={[styles.courseCard, { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' }]}
      onPress={() => handleCoursePress(item.id.toString())}
    >
      <View style={styles.courseHeader}>
        <Text style={[styles.courseName, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
          {item.name}
        </Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.status === 'active' ? '#10B981' : '#EF4444' }
        ]}>
          <Text style={styles.statusText}>
            {item.status === 'active' ? 'Faol' : 'Nofaol'}
          </Text>
        </View>
      </View>

    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }]}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }]}>
        <Text style={[styles.errorText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
          {error}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadCourses}>
          <Text style={styles.retryButtonText}>Qayta yuklash</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={[styles.header, { borderBottomColor: isDarkMode ? '#1F2937' : '#E5E7EB' }]}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setIsMenuOpen(true)}
        >
          <Ionicons
            name="menu"
            size={24}
            color={isDarkMode ? '#FFFFFF' : '#000000'}
          />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
          Mening kurslarim
        </Text>

        <View style={styles.menuButton} />
      </View>

      <FlatList
        data={courses}
        renderItem={renderCourseItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadCourses}
      />

      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        menuAnimation={menuAnimation}
        activeRoute="topics"
        onMenuPress={handleNavigation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 30,
    borderBottomWidth: 1,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  menuButton: {
    padding: 8,
    width: 40,
  },
  listContainer: {
    padding: 16,
  },
  courseCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  courseName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  courseInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    marginLeft: 4,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '500',
  },
}); 