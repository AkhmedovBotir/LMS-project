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
  Alert,
  Modal,
  Pressable
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SideMenu from '../../components/SideMenu';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api/api';
import { TeacherGroup } from '../../types/group';

const { width } = Dimensions.get('window');
const MENU_WIDTH = width * 0.8;

export default function GroupsScreen() {
  const { isDarkMode } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [groups, setGroups] = useState<TeacherGroup[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<TeacherGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<string | null>(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showDaysModal, setShowDaysModal] = useState(false);
  const menuAnimation = useRef(new Animated.Value(-MENU_WIDTH)).current;

  const daysOptions = [
    { label: 'Dushanba, Chorshanba, Juma', value: 'Dushanba, Chorshanba, Juma' },
    { label: 'Seshanba, Payshanba, Shanba', value: 'Seshanba, Payshanba, Shanba' }
  ];

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    filterGroups();
  }, [selectedCourse, selectedDays, groups]);

  const filterGroups = () => {
    let filtered = [...groups];

    if (selectedCourse) {
      filtered = filtered.filter(group => 
        group.course_id.name === selectedCourse
      );
    }

    if (selectedDays) {
      filtered = filtered.filter(group => 
        group.days === selectedDays
      );
    }

    setFilteredGroups(filtered);
  };

  const getUniqueCourses = () => {
    const courses = groups.map(group => group.course_id.name);
    return [...new Set(courses)];
  };

  useEffect(() => {
    Animated.spring(menuAnimation, {
      toValue: isMenuOpen ? 0 : -MENU_WIDTH,
      useNativeDriver: true,
    }).start();
  }, [isMenuOpen]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await AsyncStorage.getItem('token');
      console.log('Token in loadGroups:', token);
      
      if (!token) {
        console.error('Token not found');
        Alert.alert('Xatolik', 'Avtorizatsiya talab qilinadi');
        router.replace('/login');
        return;
      }

      console.log('Fetching groups...');
      const response = await api.get('/mobile/employees/my-groups');
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        console.log('Groups data:', response.data.data);
        setGroups(response.data.data);
        setFilteredGroups(response.data.data);
      } else {
        console.error('API Error:', response.data);
        setError('Guruhlarni yuklashda xatolik yuz berdi');
      }
    } catch (err: any) {
      console.error('Error in loadGroups:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers
      });
      
      if (err.message === 'Network Error') {
        setError('Internet aloqasini tekshiring');
      } else if (err.response?.status === 401) {
        Alert.alert('Xatolik', 'Avtorizatsiya talab qilinadi');
        router.replace('/login');
      } else {
        setError('Guruhlarni yuklashda xatolik yuz berdi');
      }
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

  const renderGroupItem = ({ item }: { item: TeacherGroup }) => {
    console.log('Rendering group item:', item);
    return (
    <View style={[styles.groupCard, { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' }]}>
      <View style={styles.courseInfo}>
        <Text style={[styles.courseName, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
            {item.course_id?.name || 'Noma\'lum kurs'}
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

      <View style={styles.groupInfo}>
        <Text style={[styles.groupName, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
          {item.name}
        </Text>
        
        <View style={styles.scheduleInfo}>
          <View style={styles.scheduleItem}>
            <Ionicons
              name="time-outline"
              size={16}
              color={isDarkMode ? '#9CA3AF' : '#6B7280'}
            />
            <Text style={[styles.scheduleText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
              {item.time}
            </Text>
          </View>

          <View style={styles.scheduleItem}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={isDarkMode ? '#9CA3AF' : '#6B7280'}
            />
            <Text style={[styles.scheduleText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
              {item.days}
            </Text>
          </View>
        </View>

        <Text style={[styles.dates, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
          {new Date(item.start_date).toLocaleDateString()} - {new Date(item.end_date).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
  };

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
        <TouchableOpacity style={styles.retryButton} onPress={loadGroups}>
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
          Mening guruhlarim
        </Text>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadGroups}
        >
          <Ionicons
            name="refresh"
            size={24}
            color={isDarkMode ? '#FFFFFF' : '#000000'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.selectButton, { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6', flex: 1 }]}
            onPress={() => setShowCourseModal(true)}
          >
            <Text style={[styles.selectButtonText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
              {selectedCourse || 'Kursni tanlang'}
            </Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color={isDarkMode ? '#FFFFFF' : '#000000'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.selectButton, { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6', flex: 1 }]}
            onPress={() => setShowDaysModal(true)}
          >
            <Text style={[styles.selectButtonText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
              {selectedDays || 'Kunlarni tanlang'}
            </Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color={isDarkMode ? '#FFFFFF' : '#000000'}
            />
          </TouchableOpacity>

          {(selectedCourse || selectedDays) && (
            <TouchableOpacity
              style={[styles.clearButton, { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' }]}
              onPress={() => {
                setSelectedCourse(null);
                setSelectedDays(null);
              }}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={isDarkMode ? '#FFFFFF' : '#000000'}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredGroups}
        renderItem={renderGroupItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadGroups}
      />

      <Modal
        visible={showCourseModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCourseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                Kursni tanlang
              </Text>
              <TouchableOpacity onPress={() => setShowCourseModal(false)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={isDarkMode ? '#FFFFFF' : '#000000'}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.modalList}>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setSelectedCourse(null);
                  setShowCourseModal(false);
                }}
              >
                <Text style={[styles.modalItemText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                  Barcha kurslar
                </Text>
              </TouchableOpacity>
              {getUniqueCourses().map((course) => (
                <TouchableOpacity
                  key={course}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedCourse(course);
                    setShowCourseModal(false);
                  }}
                >
                  <Text style={[styles.modalItemText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                    {course}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showDaysModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDaysModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                Kunlarni tanlang
              </Text>
              <TouchableOpacity onPress={() => setShowDaysModal(false)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={isDarkMode ? '#FFFFFF' : '#000000'}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.modalList}>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setSelectedDays(null);
                  setShowDaysModal(false);
                }}
              >
                <Text style={[styles.modalItemText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                  Barcha kunlar
                </Text>
              </TouchableOpacity>
              {daysOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedDays(option.value);
                    setShowDaysModal(false);
                  }}
                >
                  <Text style={[styles.modalItemText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        menuAnimation={menuAnimation}
        activeRoute="groups"
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
  },
  refreshButton: {
    padding: 8,
  },
  filterContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectButtonText: {
    fontSize: 16,
  },
  clearButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalList: {
    gap: 8,
  },
  modalItem: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  modalItemText: {
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  groupCard: {
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
  courseInfo: {
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
  groupInfo: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    padding: 12,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  scheduleInfo: {
    flexDirection: 'column',
    marginBottom: 8,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  scheduleText: {
    fontSize: 14,
    marginLeft: 4,
  },
  dates: {
    fontSize: 12,
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