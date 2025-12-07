import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.100.159:5000/api';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  birth_date: string;
  gender: string;
  status: string;
  payment_status: string;
  trial_lesson_date: string;
}

interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    student: Student;
  };
}

async function fetchWithAuth(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const token = await AsyncStorage.getItem('authToken');
  const headers = new Headers(init?.headers);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(`${API_URL}${input}`, {
    ...init,
    headers,
  });
}

export const authApi = {
  login: async (phone: string, password: string): Promise<LoginResponse> => {
    const response = await fetchWithAuth('/student-mobile/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    return response.json();
  },
};
