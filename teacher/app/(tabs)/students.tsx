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
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SideMenu from '../../components/SideMenu';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api/api';

const { width } = Dimensions.get('window');
const MENU_WIDTH = width * 0.8;

interface Student {
  _id: string;
  first_name: string;
  last_name: string;
  phone: string;
  birth_date: string;
  address: string;
  parent_name: string;
  parent_phone: string;
  gender: 'male' | 'female';
  status: 'active' | 'inactive';
  payment_status: 'trial' | 'paid';
  group_students: {
    _id: string;
    group_id: {
      _id: string;
      name: string;
      course_id: {
        _id: string;
        name: string;
      };
    };
    status: string;
    joined_at: string;
  }[];
}

export default function StudentsScreen() {
  const { isDarkMode } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const menuAnimation = useRef(new Animated.Value(-MENU_WIDTH)).current;

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [selectedCourse, selectedGroup, students]);

  const filterStudents = () => {
    let filtered = [...students];

    if (selectedCourse) {
      filtered = filtered.filter(student =>
        student.group_students.some(gs =>
          gs.group_id.course_id.name === selectedCourse
        )
      );
    }

    if (selectedGroup) {
      filtered = filtered.filter(student =>
        student.group_students.some(gs =>
          gs.group_id.name === selectedGroup
        )
      );
    }

    setFilteredStudents(filtered);
  };

  const getUniqueCourses = () => {
    const courses = new Set<string>();
    students.forEach(student => {
      student.group_students.forEach(gs => {
        courses.add(gs.group_id.course_id.name);
      });
    });
    return Array.from(courses);
  };

  const getUniqueGroups = () => {
    const groups = new Set<string>();
    students.forEach(student => {
      student.group_students.forEach(gs => {
        if (!selectedCourse || gs.group_id.course_id.name === selectedCourse) {
          groups.add(gs.group_id.name);
        }
      });
    });
    return Array.from(groups);
  };

  useEffect(() => {
    Animated.spring(menuAnimation, {
      toValue: isMenuOpen ? 0 : -MENU_WIDTH,
      useNativeDriver: true,
    }).start();
  }, [isMenuOpen]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await AsyncStorage.getItem('token');
      console.log('Token in loadStudents:', token);
      
      if (!token) {
        console.error('Token not found');
        Alert.alert('Xatolik', 'Avtorizatsiya talab qilinadi');
        router.replace('/login');
        return;
      }

      console.log('Fetching students...');
      const response = await api.get('/mobile/employees/my-students');
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        console.log('Students data:', response.data.data);
        setStudents(response.data.data);
        setFilteredStudents(response.data.data);
      } else {
        console.error('API Error:', response.data);
        setError('O\'quvchilarni yuklashda xatolik yuz berdi');
      }
    } catch (err: any) {
      console.error('Error in loadStudents:', err);
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
        setError('O\'quvchilarni yuklashda xatolik yuz berdi');
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

  const renderStudentItem = ({ item }: { item: Student }) => {
    const activeGroup = item.group_students.find(gs => gs.status === 'active');

    return (
      <TouchableOpacity
        style={[styles.studentCard, { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' }]}
        onPress={() => {
          setSelectedStudent(item);
          setShowStudentModal(true);
        }}
      >
        <View style={styles.studentHeader}>
          <View style={styles.studentInfo}>
            <View style={styles.avatarContainer}>
              <Ionicons
                name={item.gender === 'male' ? 'person' : 'person-outline'}
                size={24}
                color={isDarkMode ? '#FFFFFF' : '#000000'}
              />
            </View>
            <View style={styles.nameContainer}>
          <Text style={[styles.studentName, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
            {item.first_name} {item.last_name}
          </Text>
              <Text style={[styles.studentBirthDate, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                {new Date(item.birth_date).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <View style={[
            styles.paymentBadge,
            { backgroundColor: item.payment_status === 'paid' ? '#10B981' : '#F59E0B' }
          ]}>
            <Text style={styles.paymentText}>
              {item.payment_status === 'paid' ? 'To\'langan' : 'Sinov'}
          </Text>
          </View>
        </View>

        {activeGroup && (
          <View style={styles.groupInfo}>
            <View style={styles.detailRow}>
              <Ionicons
                name="book-outline"
                size={16}
                color={isDarkMode ? '#9CA3AF' : '#6B7280'}
              />
              <Text style={[styles.detailText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                {activeGroup.group_id.course_id.name}
            </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons
                name="people-outline"
                size={16}
                color={isDarkMode ? '#9CA3AF' : '#6B7280'}
              />
              <Text style={[styles.detailText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                {activeGroup.group_id.name}
            </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
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
        <TouchableOpacity style={styles.retryButton} onPress={loadStudents}>
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
          Mening o'quvchilarim
        </Text>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadStudents}
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
            onPress={() => setShowGroupModal(true)}
          >
            <Text style={[styles.selectButtonText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
              {selectedGroup || 'Guruhni tanlang'}
            </Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color={isDarkMode ? '#FFFFFF' : '#000000'}
            />
          </TouchableOpacity>

          {(selectedCourse || selectedGroup) && (
            <TouchableOpacity
              style={[styles.clearButton, { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' }]}
              onPress={() => {
                setSelectedCourse(null);
                setSelectedGroup(null);
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
        data={filteredStudents}
        renderItem={renderStudentItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadStudents}
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
        visible={showGroupModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGroupModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                Guruhni tanlang
              </Text>
              <TouchableOpacity onPress={() => setShowGroupModal(false)}>
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
                  setSelectedGroup(null);
                  setShowGroupModal(false);
                }}
              >
                <Text style={[styles.modalItemText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                  Barcha guruhlar
                </Text>
              </TouchableOpacity>
              {getUniqueGroups().map((group) => (
                <TouchableOpacity
                  key={group}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedGroup(group);
                    setShowGroupModal(false);
                  }}
                >
                  <Text style={[styles.modalItemText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                    {group}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showStudentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStudentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
            {selectedStudent && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                    {selectedStudent.first_name} {selectedStudent.last_name}
                  </Text>
                  <TouchableOpacity onPress={() => setShowStudentModal(false)}>
                    <Ionicons
                      name="close"
                      size={24}
                      color={isDarkMode ? '#FFFFFF' : '#000000'}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalSectionTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                      Shaxsiy ma'lumotlar
                    </Text>
                    <View style={styles.modalInfoRow}>
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color={isDarkMode ? '#9CA3AF' : '#6B7280'}
                      />
                      <Text style={[styles.modalInfoText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                        {new Date(selectedStudent.birth_date).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.modalInfoRow}>
                      <Ionicons
                        name="location-outline"
                        size={20}
                        color={isDarkMode ? '#9CA3AF' : '#6B7280'}
                      />
                      <Text style={[styles.modalInfoText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                        {selectedStudent.address}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={[styles.modalSectionTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                      Bog'lanish
                    </Text>
                    <View style={styles.modalInfoRow}>
                      <Ionicons
                        name="call-outline"
                        size={20}
                        color={isDarkMode ? '#9CA3AF' : '#6B7280'}
                      />
                      <Text style={[styles.modalInfoText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                        {selectedStudent.phone}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={[styles.modalSectionTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                      Ota-ona ma'lumotlari
                    </Text>
                    <View style={styles.modalInfoRow}>
                      <Ionicons
                        name="person-outline"
                        size={20}
                        color={isDarkMode ? '#9CA3AF' : '#6B7280'}
                      />
                      <Text style={[styles.modalInfoText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                        {selectedStudent.parent_name}
                      </Text>
                    </View>
                    <View style={styles.modalInfoRow}>
                      <Ionicons
                        name="call-outline"
                        size={20}
                        color={isDarkMode ? '#9CA3AF' : '#6B7280'}
                      />
                      <Text style={[styles.modalInfoText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                        {selectedStudent.parent_phone}
                      </Text>
                    </View>
                  </View>

                  {selectedStudent.group_students.map((groupStudent) => (
                    <View key={groupStudent._id} style={styles.modalSection}>
                      <Text style={[styles.modalSectionTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                        Guruh ma'lumotlari
                      </Text>
                      <View style={styles.modalInfoRow}>
                        <Ionicons
                          name="book-outline"
                          size={20}
                          color={isDarkMode ? '#9CA3AF' : '#6B7280'}
                        />
                        <Text style={[styles.modalInfoText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                          {groupStudent.group_id.course_id.name}
                        </Text>
                      </View>
                      <View style={styles.modalInfoRow}>
                        <Ionicons
                          name="people-outline"
                          size={20}
                          color={isDarkMode ? '#9CA3AF' : '#6B7280'}
                        />
                        <Text style={[styles.modalInfoText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                          {groupStudent.group_id.name}
                        </Text>
                      </View>
                      <View style={styles.modalInfoRow}>
                        <Ionicons
                          name="time-outline"
                          size={20}
                          color={isDarkMode ? '#9CA3AF' : '#6B7280'}
                        />
                        <Text style={[styles.modalInfoText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                          Qo'shilgan: {new Date(groupStudent.joined_at).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        menuAnimation={menuAnimation}
        activeRoute="students"
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
  studentCard: {
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
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nameContainer: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  studentBirthDate: {
    fontSize: 14,
  },
  groupInfo: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    padding: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentText: {
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
  modalBody: {
    padding: 16,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalInfoText: {
    fontSize: 16,
    marginLeft: 8,
    flex: 1,
  },
}); 