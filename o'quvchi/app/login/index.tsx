import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Colors, theme } from '../../constants/Color';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [displayPhone, setDisplayPhone] = useState('+998 ');
  
  // Format phone number for display: +998 90 123 45 67
  const formatPhoneNumber = (input: string) => {
    // Remove all non-digit characters
    const cleaned = input.replace(/\D/g, '');
    
    // Format the phone number with spaces
    let formatted = '';
    if (cleaned.length > 0) {
      // Always show +998
      formatted = '+998';
      
      // Add space after country code if there are more digits
      if (cleaned.length > 3) {
        // Add space after country code
        formatted += ' ';
        
        // Add operator code (90/91/93/94/95/97/98/99)
        formatted += cleaned.substring(3, 5);
        
        // Add space after operator code if there are more digits
        if (cleaned.length > 5) {
          formatted += ' ' + cleaned.substring(5, 8);
          
          // Add space after first 3 digits of local number if there are more digits
          if (cleaned.length > 8) {
            formatted += ' ' + cleaned.substring(8, 10);
            
            // Add space after next 2 digits if there are more digits
            if (cleaned.length > 10) {
              formatted += ' ' + cleaned.substring(10, 12);
            }
          }
        }
      } else {
        // If only country code is entered
        formatted = '+' + cleaned;
      }
    }
    
    return formatted;
  };
  
  // Handle phone number input changes
  const handlePhoneChange = (input: string) => {
    // Remove all non-digit characters
    const cleaned = input.replace(/\D/g, '');
    
    // Limit to 12 digits (998 + 9 digits)
    if (cleaned.length <= 12) {
      setDisplayPhone(formatPhoneNumber(cleaned));
    }
  };
  
  // Get clean phone number for API (without spaces)
  const getCleanPhoneNumber = () => {
    return displayPhone.replace(/\s+/g, '');
  };
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { login } = useAuth();
  const { isDarkMode } = useTheme();
  const router = useRouter();
  
  const colors = isDarkMode ? Colors.dark : Colors.light;
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [translateY] = useState(new Animated.Value(30));
  
  useEffect(() => {
    // Fade in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleLogin = async () => {
    const cleanPhone = getCleanPhoneNumber();
    if (!cleanPhone || !password) {
      Alert.alert('Xatolik', 'Iltimos, barcha maydonlarni to`ldiring');
      return;
    }

    try {
      setIsLoading(true);
      await login(cleanPhone, password);
    } catch (error: any) {
      Alert.alert('Xatolik', 'Telefon raqam yoki parol noto`g`ri');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      
      {/* Background Gradient */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.primary.light, opacity: 0.1 }]} />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View 
          style={[
            styles.formContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY }],
              backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              shadowColor: isDarkMode ? 'rgba(255, 215, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)',
            }
          ]}
        >
          <View style={styles.logoContainer}>
            <View style={[styles.logo, { backgroundColor: theme.colors.primary.light }]}>
              <Ionicons name="school" size={40} color="#000" />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Xush kelibsiz!</Text>
            <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>
              Iltimos, hisobingizga kiring
            </Text>
          </View>
          
          <View style={styles.inputGroup}>
            <View style={[
              styles.inputContainer, 
              { 
                backgroundColor: isDarkMode ? 'rgba(45, 45, 45, 0.8)' : 'rgba(245, 245, 245, 0.8)',
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              }
            ]}>
              <Ionicons 
                name="phone-portrait-outline" 
                size={20} 
                color={colors.tabIconDefault} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={[
                  styles.input, 
                  { 
                    color: colors.text,
                    flex: 1,
                  }
                ]}
                value={displayPhone}
                onChangeText={handlePhoneChange}
                placeholder="+998 90 123 45 67"
                placeholderTextColor={isDarkMode ? '#666' : '#999'}
                keyboardType="phone-pad"
                autoCapitalize="none"
              />
            </View>

            <View style={[
              styles.inputContainer, 
              { 
                backgroundColor: isDarkMode ? 'rgba(45, 45, 45, 0.8)' : 'rgba(245, 245, 245, 0.8)',
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                marginTop: 15,
              }
            ]}>
              <Ionicons 
                name="lock-closed-outline" 
                size={20} 
                color={colors.tabIconDefault} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={[
                  styles.input, 
                  { 
                    color: colors.text,
                    flex: 1,
                  }
                ]}
                value={password}
                onChangeText={setPassword}
                placeholder="Parol"
                placeholderTextColor={isDarkMode ? '#666' : '#999'}
                secureTextEntry={!isPasswordVisible}
              />
              <TouchableOpacity 
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                style={styles.visibilityToggle}
              >
                <Ionicons 
                  name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} 
                  size={20} 
                  color={colors.tabIconDefault} 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={{ color: theme.colors.primary.light, fontSize: 14 }}>
                Parolni unutdingizmi?
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              { 
                backgroundColor: theme.colors.primary.light,
                shadowColor: theme.colors.primary.light,
                opacity: (getCleanPhoneNumber() && password) ? 1 : 0.7,
              },
              isLoading && styles.buttonDisabled
            ]}
            onPress={handleLogin}
            disabled={isLoading || !getCleanPhoneNumber() || !password}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.buttonText}>Kirish</Text>
            )}
          </TouchableOpacity>
          
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.tabIconDefault }]}>
              Hisobingiz yo'qmi? 
            </Text>
            <TouchableOpacity>
              <Text style={[styles.footerLink, { color: theme.colors.primary.light }]}>
                Ro'yxatdan o'tish
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    borderRadius: 20,
    padding: 25,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    paddingVertical: 0,
  },
  visibilityToggle: {
    padding: 5,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  button: {
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },
  footerText: {
    fontSize: 14,
    marginRight: 5,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
