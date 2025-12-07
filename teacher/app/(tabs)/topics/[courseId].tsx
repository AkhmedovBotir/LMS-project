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
  View,
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import {
  createTopic,
  deleteTopic,
  fetchCourseTopics,
  reorderTopics,
  updateTopic
} from '../../../services/api';
import { Topic, TopicCreateRequest, TopicUpdateRequest } from '../../../types/topic';

const { width } = Dimensions.get('window');
const MENU_WIDTH = width * 0.8;

export default function TopicsScreen() {
  const { isDarkMode } = useTheme();
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    status?: 'active' | 'inactive';
  }>({
    title: '',
    status: 'active',
  });

  useEffect(() => {
    loadTopics();
  }, [courseId]);

  const loadTopics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchCourseTopics(courseId);
      if (response.success) {
        setTopics(response.data);
      } else {
        setError('Mavzularni yuklashda xatolik yuz berdi');
      }
    } catch (err) {
      setError('Mavzularni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
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
        course_id: courseId,
        title: formData.title.trim(),
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
      const response = await updateTopic(selectedTopic._id, {
        title: formData.title.trim(),
        status: formData.status || 'active',
      });

      if (response.success) {
        setTopics(topics.map(t => t._id === selectedTopic._id ? response.data : t));
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
    setSelectedTopic(topic);
    setIsDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!selectedTopic) return;
    
    try {
      setLoading(true);
      const response = await deleteTopic(selectedTopic._id);
      
      if (response.success) {
        const updatedTopics = topics.filter(t => t._id !== selectedTopic._id);
        setTopics(updatedTopics);
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setLoading(false);
      setIsDeleteModalVisible(false);
      setSelectedTopic(null);
    }
  };

  const handleReorder = async (topic: Topic, direction: 'up' | 'down') => {
    const currentIndex = topics.findIndex(t => t._id === topic._id);
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
          id: t._id,
          order_number: index + 1,
        })),
      });

      if (response.success) {
        setTopics(newTopics);
        Alert.alert('Muvaffaqiyat', 'Mavzular tartibi yangilandi');
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
          style={[styles.actionButton, { opacity: loading ? 0.5 : 1 }]}
          onPress={() => handleDeleteTopic(item)}
          disabled={loading}
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
          style={styles.backButton}
          onPress={() => router.push('/topics')}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDarkMode ? '#FFFFFF' : '#000000'}
          />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
          {topics[0]?.course_id?.name || 'Mavzular'}
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
        keyExtractor={(item) => item._id}
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

            {selectedTopic && (
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
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: isDarkMode ? '#1F2937' : '#000000' }]}
                onPress={() => {
                  setIsModalVisible(false);
                  setSelectedTopic(null);
                  setFormData({ title: '', status: 'active' });
                }}
              >
                <Text style={styles.cancelButtonText}>Bekor qilish</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: isDarkMode ? '#1F2937' : '#F59E0B' }]}
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

      <Modal
        visible={isDeleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
            <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
              Mavzuni o'chirish
            </Text>
            <Text style={[styles.modalText, { color: isDarkMode ? '#D1D5DB' : '#4B5563' }]}>
              Bu mavzuni o'chirishni xohlaysizmi?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setIsDeleteModalVisible(false);
                  setSelectedTopic(null);
                }}
              >
                <Text style={styles.modalButtonText}>Bekor qilish</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalDeleteButton]}
                onPress={confirmDelete}
                disabled={loading}
              >
                <Text style={[styles.modalButtonText, styles.modalDeleteButtonText]}>
                  {loading ? 'O\'chirilmoqda...' : 'O\'chirish'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  backButton: {
    padding: 8,
    width: 40,
  },
  addButton: {
    padding: 8,
    width: 40,
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
    width: '80%',
    padding: 20,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#E5E7EB',
  },
  modalDeleteButton: {
    backgroundColor: '#EF4444',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  modalDeleteButtonText: {
    color: '#FFFFFF',
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
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
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
}); 