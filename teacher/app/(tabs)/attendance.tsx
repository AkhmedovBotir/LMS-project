import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, Modal, TextInput, ScrollView, ActivityIndicator, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../services/api/api';
import { format } from 'date-fns';
import { Calendar } from 'react-native-calendars';
import SideMenu from '../../components/SideMenu';

const { width } = Dimensions.get('window');
const MENU_WIDTH = width * 0.8;

type Student = {
  _id: string;
  first_name: string;
  last_name: string;
  phone: string;
  parent_name: string;
  parent_phone: string;
};

type TeacherGroup = {
  _id: string;
  name: string;
  time: string;
  days: string[];
  course_id: {
    _id: string;
    name: string;
  };
};

type AttendanceRecord = {
  _id: string;
  student_id: Student;
  group_id: TeacherGroup;
  date: string;
  status: 'present' | 'absent' | 'late';
  notes: string;
  created_at: string;
  updated_at: string;
};

export default function AttendanceScreen() {
  const { isDarkMode } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuAnimation = useRef(new Animated.Value(-MENU_WIDTH)).current;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<TeacherGroup | null>(null);
  const [groups, setGroups] = useState<TeacherGroup[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedStudent, setSelectedStudent] = useState<AttendanceRecord | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [notes, setNotes] = useState('');
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<{ _id: string; name: string } | null>(null);

  const dynamicStyles = {
    calendarContainer: {
      margin: 16,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    dayText: {
      fontSize: 14,
      fontWeight: '500',
      color: isDarkMode ? '#D1D5DB' : '#4B5563',
    },
  };

  const monthNames = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
  ];

  const dayNames = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      loadAttendance();
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
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        Alert.alert('Xatolik', 'Avtorizatsiya talab qilinadi');
        router.replace('/login');
        return;
      }

      const response = await api.get('/mobile/employees/my-groups');
      
      if (response.data.success) {
        setGroups(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedGroup(response.data.data[0]);
        }
      } else {
        throw new Error(response.data.message || 'Ma\'lumotlarni yuklashda xatolik');
      }
    } catch (error: any) {
      console.error('Error loading groups:', error);
      Alert.alert('Xatolik', error.message || 'Guruhlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const loadAttendance = async () => {
    if (!selectedGroup) return;

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        Alert.alert('Xatolik', 'Avtorizatsiya talab qilinadi');
        router.replace('/login');
        return;
      }

      const date = selectedDate.toISOString().split('T')[0];
      const response = await api.get(`/attendance-students/group/${selectedGroup._id}?date=${date}`);
      
      if (response.data.success) {
        if (response.data.data.length === 0) {
          const studentsResponse = await api.get(`/mobile/employees/group/${selectedGroup._id}/students`);
          if (studentsResponse.data.success) {
            const attendanceRecords = studentsResponse.data.data.map((student: Student) => ({
              _id: '',
              student_id: student,
              group_id: selectedGroup,
              date: date,
              status: 'absent' as const,
              notes: '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }));
            setAttendance(attendanceRecords);
          }
        } else {
          setAttendance(response.data.data);
        }
      } else {
        throw new Error(response.data.message || 'Ma\'lumotlarni yuklashda xatolik');
      }
    } catch (error: any) {
      console.error('Error loading attendance:', error);
      Alert.alert('Xatolik', error.message || 'Davomat ma\'lumotlarini yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentPress = (student: AttendanceRecord) => {
    setSelectedStudent(student);
    setNotes(student.notes || '');
    setIsModalVisible(true);
  };

  const handleUpdateAttendance = async (status: 'present' | 'absent' | 'late') => {
    if (!selectedStudent) return;

    try {
      if (!selectedStudent._id) {
        const response = await api.post('/attendance-students', {
          student_id: selectedStudent.student_id._id,
          group_id: selectedGroup?._id,
          date: selectedDate.toISOString().split('T')[0],
          status,
          notes
        });

        if (response.data.success) {
          const updatedRecord = {
            ...response.data.data,
            student_id: selectedStudent.student_id,
            group_id: selectedGroup
          };
          
          setAttendance(prev => prev.map(record => 
            record.student_id._id === selectedStudent.student_id._id ? updatedRecord : record
          ));
          setIsModalVisible(false);
          setNotes('');
          Alert.alert('Muvaffaqiyatli', 'Davomat ma\'lumoti saqlandi');
        } else {
          throw new Error(response.data.message || 'Saqlashda xatolik');
        }
      } else {
        const response = await api.put(`/attendance-students/${selectedStudent._id}`, {
          status,
          notes
        });

        if (response.data.success) {
          const updatedRecord = {
            ...response.data.data,
            student_id: selectedStudent.student_id,
            group_id: selectedGroup
          };
          
          setAttendance(prev => prev.map(record => 
            record._id === selectedStudent._id ? updatedRecord : record
          ));
          setIsModalVisible(false);
          setNotes('');
          Alert.alert('Muvaffaqiyatli', 'Davomat ma\'lumoti yangilandi');
        } else {
          throw new Error(response.data.message || 'Yangilashda xatolik');
        }
      }
    } catch (error: any) {
      console.error('Error updating attendance:', error);
      Alert.alert('Xatolik', error.message || 'Davomat ma\'lumotini yangilashda xatolik yuz berdi');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return '#22C55E';
      case 'absent': return '#EF4444';
      case 'late': return '#F59E0B';
      default: return isDarkMode ? '#374151' : '#E5E7EB';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present': return 'Keldi';
      case 'absent': return 'Kelmadi';
      case 'late': return 'Kech keldi';
      default: return 'Aniqlanmadi';
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

  const renderAttendanceItem = ({ item }: { item: AttendanceRecord }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' }]}
      onPress={() => handleStudentPress(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.studentName, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
          {item.student_id.first_name} {item.student_id.last_name}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.cardInfo}>
        <Text style={[styles.infoText, { color: isDarkMode ? '#D1D5DB' : '#4B5563' }]}>
          Telefon: {item.student_id.phone}
        </Text>
        {item.notes && (
          <Text style={[styles.notes, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
            Izoh: {item.notes}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#111827' : '#F9FAFB' }]}>
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#111827' : '#F9FAFB' }]}>
        <Text style={[styles.errorText, { color: isDarkMode ? '#EF4444' : '#DC2626' }]}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#111827' : '#F3F4F6' }]}>
      <View style={[styles.header, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
        <TouchableOpacity onPress={() => setIsMenuOpen(true)} style={styles.menuButton}>
          <Ionicons name="menu" size={24} color={isDarkMode ? '#F59E0B' : '#D97706'} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDarkMode ? '#F59E0B' : '#D97706' }]}>Davomat</Text>
        <TouchableOpacity
          style={[styles.groupSelector, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }]}
          onPress={() => setShowGroupModal(true)}
        >
          <Text style={[styles.groupSelectorText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
            {selectedGroup ? `${selectedGroup.name}` : 'Guruhni tanlang'}
          </Text>
          <Ionicons name="chevron-down" size={20} color={isDarkMode ? '#FFFFFF' : '#000000'} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={dynamicStyles.calendarContainer}>
          <Calendar
            current={selectedDate.toISOString()}
            onDayPress={(day) => setSelectedDate(new Date(day.timestamp))}
            markedDates={{
              [selectedDate.toISOString().split('T')[0]]: {
                selected: true,
                selectedColor: '#F59E0B'
              }
            }}
            theme={{
              backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
              calendarBackground: isDarkMode ? '#1F2937' : '#FFFFFF',
              textSectionTitleColor: isDarkMode ? '#D1D5DB' : '#4B5563',
              selectedDayBackgroundColor: '#F59E0B',
              selectedDayTextColor: '#FFFFFF',
              todayTextColor: '#F59E0B',
              dayTextColor: isDarkMode ? '#D1D5DB' : '#4B5563',
              textDisabledColor: isDarkMode ? '#4B5563' : '#9CA3AF',
              monthTextColor: isDarkMode ? '#F59E0B' : '#D97706',
              indicatorColor: '#F59E0B',
              arrowColor: '#F59E0B',
              dotColor: '#F59E0B',
              selectedDotColor: '#FFFFFF',
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 14,
              'stylesheet.calendar.header': {
                dayTextAtIndex0: {
                  color: '#EF4444'
                },
                dayTextAtIndex6: {
                  color: '#EF4444'
                }
              }
            }}
            style={styles.calendar}
            firstDay={1}
            enableSwipeMonths={true}
            hideExtraDays={false}
            disableAllTouchEventsForDisabledDays={false}
            disableAllTouchEventsForInactiveDays={false}
            minDate={new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0]}
            maxDate={new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]}
            monthFormat="MMMM yyyy"
            renderHeader={(date) => {
              const month = monthNames[date.getMonth()];
              const year = date.getFullYear();
              return (
                <Text style={[styles.monthHeader, { color: isDarkMode ? '#F59E0B' : '#D97706' }]}>
                  {month} {year}
                </Text>
              );
            }}
            dayComponent={({ date, state }) => {
              const isToday = date.dateString === new Date().toISOString().split('T')[0];
              const isSelected = date.dateString === selectedDate.toISOString().split('T')[0];
              return (
                <TouchableOpacity
                  style={[
                    styles.dayContainer,
                    isToday && styles.todayContainer,
                    isSelected && styles.selectedContainer,
                    state === 'disabled' && styles.disabledContainer
                  ]}
                  onPress={() => !state && setSelectedDate(new Date(date.timestamp))}
                  disabled={state === 'disabled'}
                >
                  <Text
                    style={[
                      dynamicStyles.dayText,
                      isToday && styles.todayText,
                      isSelected && styles.selectedText,
                      state === 'disabled' && styles.disabledText
                    ]}
                  >
                    {date.day}
                  </Text>
                </TouchableOpacity>
              );
            }}
            renderDay={(day) => {
              return (
                <View style={styles.dayHeader}>
                  <Text style={[styles.dayHeaderText, { color: isDarkMode ? '#D1D5DB' : '#4B5563' }]}>
                    {dayNames[day.getDay()]}
                  </Text>
                </View>
              );
            }}
          />
        </View>

        <FlatList
          data={attendance}
          renderItem={renderAttendanceItem}
          keyExtractor={(item) => item._id || item.student_id._id}
          contentContainerStyle={styles.list}
        />
      </View>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                {selectedStudent?.student_id.first_name} {selectedStudent?.student_id.last_name}
              </Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <TextInput
                style={[styles.notesInput, { 
                  backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
                  color: isDarkMode ? '#FFFFFF' : '#000000'
                }]}
                placeholder="Izoh..."
                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                value={notes}
                onChangeText={setNotes}
                multiline
              />

              <View style={styles.statusButtons}>
                <TouchableOpacity
                  style={[styles.statusButton, { backgroundColor: '#22C55E' }]}
                  onPress={() => handleUpdateAttendance('present')}
                >
                  <Text style={styles.statusButtonText}>Keldi</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.statusButton, { backgroundColor: '#EF4444' }]}
                  onPress={() => handleUpdateAttendance('absent')}
                >
                  <Text style={styles.statusButtonText}>Kelmadi</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.statusButton, { backgroundColor: '#F59E0B' }]}
                  onPress={() => handleUpdateAttendance('late')}
                >
                  <Text style={styles.statusButtonText}>Kech keldi</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showGroupModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGroupModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDarkMode ? '#F59E0B' : '#D97706' }]}>
                Guruhni tanlang
              </Text>
              <TouchableOpacity onPress={() => setShowGroupModal(false)}>
                <Ionicons name="close" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              <TouchableOpacity
                style={[styles.modalItem, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }]}
                onPress={() => {
                  setSelectedGroup(null);
                  setShowGroupModal(false);
                  loadAttendance();
                }}
              >
                <Text style={[styles.modalItemText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                  Barcha guruhlar
                </Text>
              </TouchableOpacity>
              {groups.map((group) => (
                <TouchableOpacity
                  key={group._id}
                  style={[styles.modalItem, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }]}
                  onPress={() => {
                    setSelectedGroup(group);
                    setShowGroupModal(false);
                    loadAttendance();
                  }}
                >
                  <Text style={[styles.modalItemText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                    {group.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCourseModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCourseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDarkMode ? '#F59E0B' : '#D97706' }]}>
                Kursni tanlang
              </Text>
              <TouchableOpacity onPress={() => setShowCourseModal(false)}>
                <Ionicons name="close" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              <TouchableOpacity
                style={[styles.modalItem, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }]}
                onPress={() => {
                  setSelectedCourse(null);
                  setSelectedGroup(null);
                  setShowCourseModal(false);
                  setShowGroupModal(true);
                }}
              >
                <Text style={[styles.modalItemText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                  Barcha kurslar
                </Text>
              </TouchableOpacity>
              {/* Add course options here */}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        menuAnimation={menuAnimation}
        activeRoute="attendance"
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
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  menuButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  cardInfo: {
    gap: 8,
  },
  infoText: {
    fontSize: 14,
  },
  notes: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
  },
  list: {
    paddingVertical: 16,
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
    maxHeight: '80%',
  },
  modalItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalItemText: {
    fontSize: 16,
  },
  modalBody: {
    gap: 16,
  },
  notesInput: {
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  groupSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginLeft: 'auto',
    marginRight: 16,
  },
  groupSelectorText: {
    marginRight: 8,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  calendar: {
    borderRadius: 12,
  },
  dayContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  todayContainer: {
    backgroundColor: '#F59E0B',
  },
  selectedContainer: {
    backgroundColor: '#F59E0B',
  },
  disabledContainer: {
    opacity: 0.3,
  },
  todayText: {
    color: '#FFFFFF',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  disabledText: {
    color: '#9CA3AF',
  },
  monthHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 10,
    textAlign: 'center',
  },
  dayHeader: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

