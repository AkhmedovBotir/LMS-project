import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { 
  ActivityIndicator, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Login() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      
      console.log('Login attempt with username:', username.trim());
      console.log('API URL being used:', 'http://10.93.4.21:5000/api/employees/login');

      if (!username.trim() || !password.trim()) {
        setError('Foydalanuvchi nomi va parol kiritilishi shart');
        return;
      }

      const result = await login(username.trim(), password.trim());
      console.log('Login result:', { success: result.success, message: result.message });
      
      if (result.success) {
        router.replace('/(tabs)/dashboard');
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Detailed login error:', err);
      setError('Login jarayonida xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }]}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.formContainer, { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' }]}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/images/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={[styles.title, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
            Tizimga kirish
          </Text>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons 
                name="person-outline" 
                size={20} 
                color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                style={styles.inputIcon}
              />
              <TextInput
                value={username}
                onChangeText={setUsername}
                style={[
                  styles.input,
                  {
                    backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
                    color: isDarkMode ? '#FFFFFF' : '#000000',
                    borderColor: isDarkMode ? '#4B5563' : '#D1D5DB'
                  }
                ]}
                placeholder="Foydalanuvchi nomi"
                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                editable={!loading}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons 
                name="lock-closed-outline" 
                size={20} 
                color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                style={styles.inputIcon}
              />
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={[
                  styles.input,
                  {
                    backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
                    color: isDarkMode ? '#FFFFFF' : '#000000',
                    borderColor: isDarkMode ? '#4B5563' : '#D1D5DB'
                  }
                ]}
                placeholder="Parol"
                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                editable={!loading}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={togglePasswordVisibility}
                style={styles.eyeIcon}
                disabled={loading}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color={isDarkMode ? '#9CA3AF' : '#6B7280'}
                />
              </TouchableOpacity>
            </View>
          </View>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Kirish</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    paddingLeft: 40,
    fontSize: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    zIndex: 1,
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#F59E0B',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 