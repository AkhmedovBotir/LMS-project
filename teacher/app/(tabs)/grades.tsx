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
  TextInput,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SideMenu from '../../components/SideMenu';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api/api';
import { Calendar } from 'react-native-calendars';

const { width } = Dimensions.get('window');
const MENU_WIDTH = width * 0.8;

interface Student {
  _id: string;
  first_name: string;
  last_name: string;
}

interface Grade {
  _id: string;
  student_id: Student;
  mark: number;
  note: string;
  date: string;
}

interface Group {
  _id: string;
  name: string;
  course_id: {
    _id: string;
    name: string;
  };
}

export default function GradesScreen() {
  const { isDarkMode } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const menuAnimation = useRef(new Animated.Value(-MENU_WIDTH)).current;

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      loadGrades();
    }
  }, [selectedGroup, selectedDate]);

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
      if (!token) {
        Alert.alert('Xatolik', 'Avtorizatsiya talab qilinadi');
        router.replace('/login');
        return;
      }

      const response = await api.get('/mobile/employees/my-groups');
      if (response.data.success) {
        setGroups(response.data.data);
      } else {
        setError('Guruhlarni yuklashda xatolik yuz berdi');
      }
    } catch (err: any) {
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

  const loadGrades = async () => {
    if (!selectedGroup) return;

    try {
      setLoading(true);
      setError(null);

      const studentsResponse = await api.get('/mobile/employees/my-students');

      if (studentsResponse.data.success) {
        // Then get grades for these students
        const gradesResponse = await api.get('/mobile/employees/grades', {
          params: {
            group_id: selectedGroup._id,
            date: selectedDate
          }
        });

        if (gradesResponse.data.success) {
          // Combine students with their grades
          const studentsWithGrades = studentsResponse.data.data
            .filter((student: any) => 
              student.group_students.some((gs: any) => 
                gs.group_id._id === selectedGroup._id && gs.status === 'active'
              )
            )
            .map((student: any) => {
              const grade = gradesResponse.data.data.find((g: any) => g.student_id._id === student._id);
              return {
                _id: student._id,
                student_id: {
                  _id: student._id,
                  first_name: student.first_name,
                  last_name: student.last_name
                },
                mark: grade ? grade.mark : 0,
                note: grade ? grade.note : '',
                date: selectedDate
              };
            });
          setGrades(studentsWithGrades);
        } else {
          setError('Baxolarni yuklashda xatolik yuz berdi');
        }
      } else {
        setError('O\'quvchilarni yuklashda xatolik yuz berdi');
      }
    } catch (err: any) {
      if (err.message === 'Network Error') {
        setError('Internet aloqasini tekshiring');
      } else {
        setError('Baxolarni yuklashda xatolik yuz berdi');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGrades = async () => {
    if (!selectedGroup) return;

    try {
      setLoading(true);
      const gradesData = grades
        .filter(grade => grade.mark >= 1 && grade.mark <= 5)
        .map(grade => ({
          student_id: grade.student_id._id,
          mark: grade.mark,
          note: grade.note || ''
        }));

      if (gradesData.length !== grades.length) {
        Alert.alert('Xatolik', 'Har bir o\'quvchi uchun 1 dan 5 gacha baho kiriting');
        return;
      }

      const requestData = {
        group_id: selectedGroup._id,
        date: selectedDate,
        grades: gradesData
      };

      console.log('Sending request with data:', requestData);

      const response = await api.post('/mobile/employees/grade-students', requestData);

      console.log('Response:', response.data);

      if (response.data.success) {
        setShowSuccessModal(true);
        loadGrades(); // Reload grades after saving
      } else {
        Alert.alert('Xatolik', response.data.message || 'Baxolarni saqlashda xatolik yuz berdi');
      }
    } catch (err: any) {
      console.error('Error saving grades:', err);
      console.error('Request data:', {
        group_id: selectedGroup._id,
        date: selectedDate,
        grades: grades.map(g => ({
          student_id: g.student_id._id,
          mark: g.mark,
          note: g.note
        }))
      });
      Alert.alert('Xatolik', err.response?.data?.message || 'Baxolarni saqlashda xatolik yuz berdi');
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

  const handleDateSelect = (date: any) => {
    setSelectedDate(date.dateString);
    setShowDatePicker(false);
  };

  const renderGradeItem = ({ item }: { item: Grade }) => {
    return (
      <View style={[styles.gradeCard, { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' }]}>
        <View style={styles.studentInfo}>
          <Text style={[styles.studentName, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
            {item.student_id.first_name} {item.student_id.last_name}
          </Text>
        </View>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => {
                const updatedGrades = grades.map(g => 
                  g._id === item._id ? { ...g, mark: star } : g
                );
                setGrades(updatedGrades);
              }}
            >
              <Ionicons
                name={item.mark >= star ? "star" : "star-outline"}
                size={32}
                color="#FFD700"
                style={styles.starIcon}
              />
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.noteInput}>
          <TextInput
            style={[styles.noteText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}
            value={item.note}
            placeholder="Izoh..."
            placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
            onChangeText={(text) => {
              const updatedGrades = grades.map(g => 
                g._id === item._id ? { ...g, note: text } : g
              );
              setGrades(updatedGrades);
            }}
          />
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
          Baxolash
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
            onPress={() => setShowGroupModal(true)}
          >
            <Text style={[styles.selectButtonText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
              {selectedGroup ? selectedGroup.name : 'Guruhni tanlang'}
            </Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color={isDarkMode ? '#FFFFFF' : '#000000'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.selectButton, { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6', flex: 1 }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[styles.selectButtonText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
              {selectedDate}
            </Text>
            <Ionicons
              name="calendar"
              size={20}
              color={isDarkMode ? '#FFFFFF' : '#000000'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {selectedGroup && (
        <FlatList
          data={grades}
          renderItem={renderGradeItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {selectedGroup && (
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: '#FFD700' }]}
          onPress={handleSaveGrades}
        >
          <Text style={styles.saveButtonText}>Saqlash</Text>
        </TouchableOpacity>
      )}

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
            <FlatList
              data={groups}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.groupItem, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}
                  onPress={() => {
                    setSelectedGroup(item);
                    setShowGroupModal(false);
                  }}
                >
                  <Text style={[styles.groupText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.modalList}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                Sanani tanlang
              </Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={isDarkMode ? '#FFFFFF' : '#000000'}
                />
              </TouchableOpacity>
            </View>
            <Calendar
              onDayPress={handleDateSelect}
              markedDates={{
                [selectedDate]: { selected: true, selectedColor: '#FFD700' }
              }}
              maxDate={new Date().toISOString().split('T')[0]}
              theme={{
                backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                calendarBackground: isDarkMode ? '#1F2937' : '#FFFFFF',
                textSectionTitleColor: isDarkMode ? '#FFFFFF' : '#000000',
                selectedDayBackgroundColor: '#FFD700',
                selectedDayTextColor: '#000000',
                todayTextColor: '#FFD700',
                dayTextColor: isDarkMode ? '#FFFFFF' : '#000000',
                textDisabledColor: isDarkMode ? '#4B5563' : '#9CA3AF',
                monthTextColor: isDarkMode ? '#FFFFFF' : '#000000',
                arrowColor: '#FFD700',
              }}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showSuccessModal}
        transparent
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.successModalContent, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={64} color="#10B981" />
            </View>
            <Text style={[styles.successTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
              Muvaffaqiyatli
            </Text>
            <Text style={[styles.successMessage, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
              Baxolar muvaffaqiyatli saqlandi
            </Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.successButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        menuAnimation={menuAnimation}
        activeRoute="grades"
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
  listContainer: {
    padding: 16,
  },
  gradeCard: {
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
  studentInfo: {
    marginBottom: 12,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  starIcon: {
    marginHorizontal: 4,
  },
  noteInput: {
    marginTop: 8,
  },
  noteText: {
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 8,
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
  modalOverlay: {
    display: 'flex',
    width: '100%',
    height: '100%',
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
    flexGrow: 1,
  },
  groupItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  groupText: {
    fontSize: 16,
  },
  modalItem: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  modalItemText: {
    fontSize: 16,
  },
  saveButton: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successModalContent: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '80%',
    maxWidth: 400,
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  successButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  successButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 