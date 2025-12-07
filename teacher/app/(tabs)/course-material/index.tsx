import React, { useEffect, useState, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  Dimensions,
  Animated
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { api } from '@/services/api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import SideMenu from '@/components/SideMenu';

const { width } = Dimensions.get('window');
const MENU_WIDTH = width * 0.8;

interface Course {
  _id: string;
  name: string;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: MENU_WIDTH,
    zIndex: 1000,
    elevation: 5,
  },
  contentContainer: {
    paddingTop: 30,
    flex: 1,
    backgroundColor: '#F3F4F6',
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFD700',
    elevation: 3,
  },
  menuButton: {
    padding: 5,
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 900,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#FFD700',
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  courseItem: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  courseText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    flexGrow: 1,
    width: '100%',
  },
});

const CourseMaterials = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuAnimation = useRef(new Animated.Value(-MENU_WIDTH)).current;
  const isFocused = useIsFocused();

  // Handle menu animation
  useEffect(() => {
    const toValue = isMenuOpen ? 0 : -MENU_WIDTH;
    
    // Initialize animation value
    menuAnimation.setValue(-MENU_WIDTH);
    
    // Animate to target value
    Animated.timing(menuAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    if (isFocused) {
      fetchCourses();
    }
  }, [isFocused]);

  const fetchCourses = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setError('Token topilmadi');
        return;
      }
      const response = await api.get('/mobile/employees/my-courses');
      setCourses(response.data.data);
    } catch (err: any) {
      setError('Kurslar yuklanishida xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = useCallback((route: string) => {
    setIsMenuOpen(false);
    if (route === 'login') {
      router.replace('/login');
    } else if (route !== 'course-material') {
      router.push(route as any);
    }
  }, [router]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDarkMode ? '#FFFFFF' : '#000000'} />
          <Text style={[styles.loadingText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
            Kurslar yuklanmoqda...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: isDarkMode ? '#FFD700' : '#FFD700' }]}
            onPress={() => {
              setError(null);
              setLoading(true);
              fetchCourses();
            }}
          >
            <Text style={[styles.buttonText, { color: '#000000' }]}>
              Qayta urinib ko'rish
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (courses.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' }]}>
        <Text style={[styles.subtitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
          Kurslar mavjud emas
        </Text>
      </View>
    );
  }



  // Create interpolated value for content translation
  const contentTranslateX = menuAnimation.interpolate({
    inputRange: [-MENU_WIDTH, 0],
    outputRange: [0, MENU_WIDTH],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' }]}>
{/* Side Menu */}
      <Animated.View 
        style={[
          styles.menuContainer,
          {
            transform: [{ translateX: menuAnimation }],
            backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
          },
        ]}
      >
        <SideMenu 
          isOpen={isMenuOpen}
          onClose={closeMenu}
          menuAnimation={menuAnimation}
          activeRoute="course-material"
          onMenuPress={handleNavigation}
        />
      </Animated.View>

      {/* Main Content */}
      <Animated.View 
        style={[
          styles.contentContainer,
          { transform: [{ translateX: contentTranslateX }] },
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
            <Ionicons name="menu" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
            Kurs materiallari
          </Text>
        </View>
        <View style={[styles.content, { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' }]}>
          <Text style={[styles.title, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
            Kurslar
          </Text>
          <View style={styles.list}>
            <FlatList
              data={courses}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.courseItem, { backgroundColor: isDarkMode ? '#374151' : '#FFFFFF' }]}
                  onPress={() => router.push({ pathname: '/course-material/[courseId]', params: { courseId: item._id } })}
                >
                  <Text style={[styles.courseText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Animated.View>
      
      {/* Overlay when menu is open */}
      {isMenuOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={closeMenu}
        />
      )}
    </View>
  );
};

export default CourseMaterials;