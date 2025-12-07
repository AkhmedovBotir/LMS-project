import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Colors, theme } from '../../constants/Color';

export default function ProfileScreen() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const colors = isDarkMode ? Colors.dark : Colors.light;
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.profileContainer}>
        <View style={[styles.avatar, { backgroundColor: isDarkMode ? '#333' : '#f0f0f0' }]}>
          <Text style={[styles.avatarText, { color: isDarkMode ? '#fff' : '#000' }]}>
            {user?.first_name?.[0]?.toUpperCase()}
            {user?.last_name?.[0]?.toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.name, { color: colors.text }]}>
          {user?.first_name} {user?.last_name}
        </Text>
        <Text style={{ color: colors.tabIconDefault, marginBottom: 20 }}>
          {user?.phone}
        </Text>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: isDarkMode ? '#333' : '#f0f0f0' }]}
          onPress={toggleTheme}
        >
          <Text style={{ color: colors.text }}>
            {isDarkMode ? 'Kunduzgi rejim' : 'Tungi rejim'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#ff3b30', marginTop: 20 }]}
          onPress={handleLogout}
        >
          <Text style={{ color: '#fff' }}>Chiqish</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileContainer: {
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
});
