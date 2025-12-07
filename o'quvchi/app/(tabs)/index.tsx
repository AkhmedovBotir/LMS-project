import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, theme } from '../../constants/Color';
import { useTheme } from '../../context/ThemeContext';

// Mock data
const upcomingClasses = [
  { id: '1', title: 'Matematika', time: '10:00 - 11:30', room: '302', teacher: 'Alijonov A.' },
  { id: '2', title: 'Fizika', time: '12:00 - 13:30', room: '205', teacher: 'Karimova Z.' },
  { id: '3', title: 'Informatika', time: '14:00 - 15:30', room: '101', teacher: 'Yusupov B.' },
];

const assignments = [
  { id: '1', title: 'Matematika vazifasi', subject: 'Matematika', dueDate: '10.07.2024', completed: false },
  { id: '2', title: 'Fizika laboratoriya', subject: 'Fizika', dueDate: '12.07.2024', completed: true },
];

export default function HomeScreen() {
  const { isDarkMode, toggleTheme } = useTheme();
  const colors = isDarkMode ? Colors.dark : Colors.light;
  const currentDate = new Date().toLocaleDateString('uz-UZ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const [isStoryVisible, setIsStoryVisible] = useState(false);
  const [activeStory, setActiveStory] = useState<any>(null);
  const progress = useRef(new Animated.Value(0)).current;

  const stories = [
    { 
      id: 1, 
      username: 'Alisher', 
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60&fit=crop&w=100'
    },
    { 
      id: 2, 
      username: 'Zaynab', 
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=60',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=60&fit=crop&w=100'
    },
    { 
      id: 3, 
      username: 'Javlon', 
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=60',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60&fit=crop&w=100'
    },
    { 
      id: 4, 
      username: 'Gulbahor', 
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=60',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60&fit=crop&w=100'
    },
    { 
      id: 5, 
      username: 'Miraziz', 
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=60',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=60&fit=crop&w=100'
    },
  ];

  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  const handleStoryPress = (story: any) => {
    const index = stories.findIndex(s => s.id === story.id);
    setCurrentStoryIndex(index);
    setActiveStory(story);
    setIsStoryVisible(true);
  };

  const closeStory = () => {
    setIsStoryVisible(false);
    setActiveStory(null);
    progress.setValue(0);
  };

  const goToNextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      const nextIndex = currentStoryIndex + 1;
      setCurrentStoryIndex(nextIndex);
      setActiveStory(stories[nextIndex]);
      progress.setValue(0);
      Animated.timing(progress, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished && nextIndex < stories.length - 1) {
          goToNextStory();
        } else if (finished) {
          closeStory();
        }
      });
    } else {
      closeStory();
    }
  };

  const goToPrevStory = () => {
    if (currentStoryIndex > 0) {
      const prevIndex = currentStoryIndex - 1;
      setCurrentStoryIndex(prevIndex);
      setActiveStory(stories[prevIndex]);
      progress.setValue(0);
      Animated.timing(progress, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      goToNextStory();
    } else {
      goToPrevStory();
    }
  };

  useEffect(() => {
    if (isStoryVisible) {
      progress.setValue(0);
      Animated.timing(progress, {
        toValue: 1,
        duration: 5000, // 5 seconds
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          closeStory();
        }
      });
    }
  }, [isStoryVisible]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={24} color={theme.colors.primary.light} />
          </View>
          <View>
            <Text style={[styles.greeting, { color: colors.text }]}>Alisher Karimov</Text>
            <Text style={[styles.date, { color: colors.tabIconDefault }]}>{currentDate}</Text>
          </View>
        </View>
        <View style={styles.iconsContainer}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
            <View style={[styles.notificationBadge, { backgroundColor: theme.colors.primary.light }]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={toggleTheme}
          >
            <Ionicons
              name={isDarkMode ? 'moon' : 'sunny'}
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>

        {/* Stories */}
        <View style={styles.storiesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {stories.map((story) => (
              <TouchableOpacity 
                key={story.id} 
                style={styles.storyItem} 
                onPress={() => handleStoryPress(story)}
              >
                <View style={styles.storyAvatarWrapper}>
                  <Image 
                    source={{ uri: story.avatar }} 
                    style={styles.storyAvatarImage} 
                  />
                </View>
                <Text style={[styles.storyUsername, { color: colors.text }]}>
                  {story.username}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Upcoming Classes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Keyingi darslar
            </Text>
            <TouchableOpacity>
              <Text style={{ color: theme.colors.primary.light }}>Barchasi</Text>
            </TouchableOpacity>
          </View>

          {upcomingClasses.map((item) => (
            <View key={item.id} style={[styles.classCard, { backgroundColor: colors.card }]}>
              <View style={styles.classTime}>
                <Text style={styles.classTimeText}>{item.time}</Text>
              </View>
              <View style={styles.classInfo}>
                <Text style={[styles.classTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.classDetail, { color: colors.tabIconDefault }]}>
                  {item.teacher} • {item.room} xona
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.tabIconDefault} />
            </View>
          ))}
        </View>

        {/* Assignments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Vazifalar
            </Text>
            <TouchableOpacity>
              <Text style={{ color: theme.colors.primary.light }}>Barchasi</Text>
            </TouchableOpacity>
          </View>

          {assignments.map((item) => (
            <View key={item.id} style={[styles.assignmentCard, { backgroundColor: colors.card }]}>
              <View style={[
                styles.assignmentStatus,
                {
                  backgroundColor: item.completed
                    ? '#4CAF50'
                    : theme.colors.primary.light + '20',
                  borderColor: item.completed ? '#4CAF50' : theme.colors.primary.light
                }
              ]}>
                <Ionicons
                  name={item.completed ? 'checkmark' : 'time'}
                  size={16}
                  color={item.completed ? 'white' : theme.colors.primary.light}
                />
              </View>
              <View style={styles.assignmentInfo}>
                <Text style={[styles.assignmentTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.assignmentSubject, { color: colors.tabIconDefault }]}>
                  {item.subject}
                </Text>
              </View>
              <Text style={[styles.assignmentDue, { color: colors.tabIconDefault }]}>
                {item.dueDate}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Story Modal */}
      <Modal visible={isStoryVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={closeStory}>
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
          
          {/* Progress Bar */}
          <View style={styles.progressBarBackground}>
            {stories.map((_, index) => (
              <View key={index} style={styles.progressBarTrack}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      width: index === currentStoryIndex 
                        ? progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%'],
                          })
                        : index < currentStoryIndex ? '100%' : '0%',
                    },
                  ]}
                />
              </View>
            ))}
          </View>

          {/* User Info */}
          <View style={styles.modalHeader}>
            <Image 
              source={{ uri: activeStory?.avatar }} 
              style={styles.modalAvatar} 
            />
            <Text style={styles.modalUsername}>{activeStory?.username}</Text>
          </View>

          {/* Story Image */}
          <Image 
            source={{ uri: activeStory?.image }} 
            style={styles.storyFullImage}
            resizeMode="cover"
          />

          {/* Navigation Buttons */}
          <View style={styles.navigationContainer}>
            <TouchableOpacity 
              style={[styles.navButton, styles.leftNavButton]} 
              onPress={() => handleSwipe('right')}
              activeOpacity={0.7}
            />
            <TouchableOpacity 
              style={[styles.navButton, styles.rightNavButton]} 
              onPress={() => handleSwipe('left')}
              activeOpacity={0.7}
            />
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
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: theme.colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  date: {
    fontSize: 13,
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  classCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  classTime: {
    marginRight: 15,
    alignItems: 'center',
  },
  classTimeText: {
    color: theme.colors.primary.light,
    fontWeight: '600',
  },
  classInfo: {
    flex: 1,
  },
  classTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  classDetail: {
    fontSize: 13,
  },
  assignmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  assignmentStatus: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginRight: 15,
  },
  assignmentInfo: {
    flex: 1,
  },
  assignmentTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  assignmentSubject: {
    fontSize: 13,
  },
  assignmentDue: {
    fontSize: 12,
    fontWeight: '500',
  },
  storiesContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  storyItem: {
    marginRight: 15,
    alignItems: 'center',
    width: 64,
  },
  storyAvatarWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 2,
    backgroundColor: theme.colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyAvatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: theme.colors.primary.light,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeader: {
    position: 'absolute',
    top: 60,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
    width: '90%',
  },
  modalAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: theme.colors.primary.light,
  },
  storyFullImage: {
    width: '100%',
    height: '100%',
  },
  modalUsername: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 5,
  },
  progressBarBackground: {
    position: 'absolute',
    top: 50,
    width: '90%',
    height: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  progressBarTrack: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 2,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'white',
  },
  navigationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    zIndex: 1,
  },
  navButton: {
    flex: 1,
    height: '100%',
  },
  leftNavButton: {
    // Styles for left navigation area
  },
  rightNavButton: {
    // Styles for right navigation area
  },
  
  storyUsername: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  
});
