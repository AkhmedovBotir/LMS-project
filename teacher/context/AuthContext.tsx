import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useState } from 'react';
import { router } from 'expo-router';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: {
    id: number;
    username: string;
    role: number;
    first_name: string;
    last_name: string;
    department_id: number;
    position_id: number;
  } | null;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthContextType['user']>(null);

  const login = async (username: string, password: string) => {
    try {
      if (!username || !password) {
        return {
          success: false,
          message: 'Foydalanuvchi nomi va parol kiritilishi shart',
        };
      }

      const response = await fetch('http://10.93.4.21:5000/api/employees/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.message && data.data?.token) {
        try {
          const token = data.data.token;
          await AsyncStorage.setItem('token', token);
          const decodedToken = JSON.parse(atob(token.split('.')[1]));
          console.log(decodedToken);
          await AsyncStorage.setItem('user', JSON.stringify(decodedToken));
          
          setToken(token);
          setIsAuthenticated(true);
          setUser({
            id: decodedToken.id,
            username: decodedToken.username,
            role: decodedToken.role,
            first_name: decodedToken.first_name,
            last_name: decodedToken.last_name,
            department_id: decodedToken.department_id,
            position_id: decodedToken.position_id,
          });

          return {
            success: true,
            message: data.message || 'Login muvaffaqiyatli',
          };
        } catch (storageError) {
          console.error('Token storage error:', storageError);
          await logout();
          router.replace('/login');
          return {
            success: false,
            message: 'Login ma\'lumotlarini saqlashda xatolik yuz berdi',
          };
        }
      }

      return {
        success: false,
        message: data.message || 'Login ma\'lumotlari noto\'g\'ri',
      };
    } catch (error) {
      console.error('Login error:', error);
      await logout();
      router.replace('/login');
      return {
        success: false,
        message: 'Serverga ulanishda xatolik yuz berdi',
      };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setToken(null);
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 