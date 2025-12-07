// app/topics/[courseId].tsx
import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import SideMenu from '../../../components/SideMenu';
import { useTheme } from '../../../context/ThemeContext';
import {
  createTopic,
  deleteTopic,
  fetchCourseTopics,
  reorderTopics,
  updateTopic
} from '../../../services/api';

const { width } = Dimensions.get('window');
const MENU_WIDTH = width * 0.8;

interface Topic {
  id: number;
  course_id: number;
  title: string;
  order_number: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  course?: { id: number; name: string };
}

interface TopicFormData {
  title: string;
  status: 'active' | 'inactive';
  order_number?: number;
}

export default function TopicsScreen() {
  const { isDarkMode } = useTheme();
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [formData, setFormData] = useState<TopicFormData>({
    title: '',
    status: 'active',
  });
  const menuAnimation = useRef(new Animated.Value(-MENU_WIDTH)).current;

  useEffect(() => {
    loadTopics();
  }, [courseId]);

  useEffect(() => {
    Animated.spring(menuAnimation, {
      toValue: isMenuOpen ? 0 : -MENU_WIDTH,
      useNativeDriver: true,
    }).start();
  }, [isMenuOpen]);

  const loadTopics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchCourseTopics(Number(courseId));
      if (response.success) {
        setTopics(response.data);
      } else {
        setError(response.message || 'Mavzularni yuklashda xatolik yuz berdi');
      }
    } catch (err) {
      setError('Mavzularni yuklashda xatolik yuz berdi');
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

  const handleAddTopic = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Xatolik', 'Mavzu nomini kiriting');
      return;
    }

    try {
      setLoading(true);
      const response = await createTopic({
        course_id: Number(courseId),
        title: formData.title.trim(),
        order_number: topics.length + 1,
      });

      if (response.success) {
        setTopics([...topics, response.data]);
        setFormData({ title: '', status: 'active' });
        setIsModalVisible(false);
        Alert.alert('Muvaffaqiyat', 'Mavzu qo\'shildi');
      } else {
        Alert.alert('Xatolik', response.message || 'Mavzu qo\'shishda xatolik yuz berdi');
      }
    } catch (err) {
      Alert.alert('Xatolik', 'Mavzu qo\'shishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTopic = async () => {
    if (!selectedTopic || !formData.title.trim()) {
      Alert.alert('Xatolik', 'Mavzu nomini kiriting');
      return;
    }

    try {
      setLoading(true);
      const response = await updateTopic(selectedTopic.id, {
        title: formData.title.trim(),
        status: formData.status,
      });

      if (response.success) {
        setTopics(topics.map(t => t.id === selectedTopic.id ? response.data : t));
        setFormData({ title: '', status: 'active' });
        setSelectedTopic(null);
        setIsModalVisible(false);
        Alert.alert('Muvaffaqiyat', 'Mavzu yangilandi');
      } else {
        Alert.alert('Xatolik', response.message || 'Mavzuni yangilashda xatolik yuz berdi');
      }
    } catch (err) {
      Alert.alert('Xatolik', 'Mavzuni yangilashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTopic = async (topic: Topic) => {
    Alert.alert(
      'Tasdiqlash',
      'Mavzuni o\'chirishni xohlaysizmi?',
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: 'O\'chirish',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await deleteTopic(topic.id);
              if (response.success) {
                setTopics(topics.filter(t => t.id !== topic.id));
                Alert.alert('Muvaffaqiyat', response.message || 'Mavzu o\'chirildi');
              } else {
                Alert.alert('Xatolik', response.message || 'Mavzuni o\'chirishda xatolik yuz berdi');
              }
            } catch (err) {
              Alert.alert('Xatolik', 'Mavzuni o\'chirishda xatolik yuz berdi');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleReorder = async (topic: Topic, direction: 'up' | 'down') => {
    const currentIndex = topics.findIndex(t => t.id === topic.id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === topics.length - 1)
    ) {
      return;
    }

    const newTopics = [...topics];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    [newTopics[currentIndex], newTopics[targetIndex]] = [newTopics[targetIndex], newTopics[currentIndex]];

    try {
      setLoading(true);
      const response = await reorderTopics({
        topics: newTopics.map((t, index) => ({
          id: t.id,
          order_number: index + 1,
        })),
      });

      if (response.success) {
        setTopics(newTopics);
        Alert.alert('Muvaffaqiyat', response.message || 'Mavzular tartibi yangilandi');
      } else {
        Alert.alert('Xatolik', response.message || 'Mavzular tartibini o\'zgartirishda xatolik yuz berdi');
        await loadTopics(); // Xatolik yuz berganda asl holatni qayta yuklaymiz
      }
    } catch (err) {
      Alert.alert('Xatolik', 'Mavzular tartibini o\'zgartirishda xatolik yuz berdi');
      await loadTopics();
    } finally {
      setLoading(false);
    }
  };

  const renderTopicItem = ({ item, index }: { item: Topic; index: number }) => (
    <View style={[styles.topicCard, { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' }]}>
        <View style={styles.topicHeader}>
        <Text style={[styles.topicTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
          {index + 1}. {item.title}
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

      <View style={styles.topicActions}>
        <TouchableOpacity
          style={[styles.actionButton, { opacity: index === 0 ? 0.5 : 1 }]}
          onPress={() => handleReorder(item, 'up')}
          disabled={index === 0}
        >
          <Ionicons name="arrow-up" size={20} color={isDarkMode ? '#FFFFFF' : '#000000'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { opacity: index === topics.length - 1 ? 0.5 : 1 }]}
          onPress={() => handleReorder(item, 'down')}
          disabled={index === topics.length - 1}
        >
          <Ionicons name="arrow-down" size={20} color={isDarkMode ? '#FFFFFF' : '#000000'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            setSelectedTopic(item);
            setFormData({
              title: item.title,
              status: item.status,
            });
            setIsModalVisible(true);
          }}
        >
          <Ionicons name="pencil" size={20} color={isDarkMode ? '#FFFFFF' : '#000000'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteTopic(item)}
        >
          <Ionicons name="trash" size={20} color="#EF4444" />
      </TouchableOpacity>
      </View>
    </View>
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
        <TouchableOpacity style={styles.retryButton} onPress={loadTopics}>
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
          {topics[0]?.course?.name || 'Mavzular'}
        </Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setSelectedTopic(null);
            setFormData({ title: '', status: 'active' });
            setIsModalVisible(true);
          }}
        >
          <Ionicons
            name="add"
            size={24}
            color={isDarkMode ? '#FFFFFF' : '#000000'}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={topics}
        renderItem={renderTopicItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadTopics}
      />

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
            <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
              {selectedTopic ? 'Mavzuni tahrirlash' : 'Yangi mavzu qo\'shish'}
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
                  color: isDarkMode ? '#FFFFFF' : '#000000',
                },
              ]}
              placeholder="Mavzu nomi"
              placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />

            <View style={styles.statusContainer}>
              <Text style={[styles.statusLabel, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                Holati:
              </Text>
              <Switch
                value={formData.status === 'active'}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value ? 'active' : 'inactive' })
                }
                trackColor={{ false: '#EF4444', true: '#10B981' }}
                thumbColor={isDarkMode ? '#FFFFFF' : '#FFFFFF'}
              />
              <Text style={[styles.statusValue, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                {formData.status === 'active' ? 'Faol' : 'Nofaol'}
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setIsModalVisible(false);
                  setSelectedTopic(null);
                  setFormData({ title: '', status: 'active' });
                }}
              >
                <Text style={styles.cancelButtonText}>Bekor qilish</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={selectedTopic ? handleUpdateTopic : handleAddTopic}
              >
                <Text style={styles.submitButtonText}>
                  {selectedTopic ? 'Saqlash' : 'Qo\'shish'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  },
  addButton: {
    padding: 8,
  },
  listContainer: {
    padding: 16,
  },
  topicCard: {
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
  topicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: '500',
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
  topicActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
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
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  statusValue: {
    fontSize: 16,
    marginLeft: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#EF4444',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#10B981',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});