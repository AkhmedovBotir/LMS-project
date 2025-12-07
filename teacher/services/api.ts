// services/api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CoursesResponse } from '../types/course';
import { GroupCreateRequest, GroupResponse, GroupsResponse, GroupUpdateRequest } from '../types/group';
import {
  DeleteResponse,
  TopicCreateRequest,
  TopicReorderRequest,
  TopicResponse,
  TopicsResponse,
  TopicUpdateRequest,
} from '../types/topic';


const API_URL = 'http://10.93.4.21:5000/api';

const getHeaders = async (): Promise<Record<string, string>> => {
  const token = await AsyncStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }
  return data;
};

// Courses
export const fetchMyCourses = async (): Promise<CoursesResponse> => {
  try {
    const response = await fetch(`${API_URL}/mobile/employees/my-courses`, {
      method: 'GET',
      headers: await getHeaders(),
    });
    return await handleResponse<CoursesResponse>(response);
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    throw new Error(error.message || 'Kurslarni yuklashda xatolik yuz berdi');
  }
};

// Groups
export const fetchMyGroups = async (): Promise<GroupsResponse> => {
  try {
    const response = await fetch(`${API_URL}/mobile/employees/my-groups`, {
      method: 'GET',
      headers: await getHeaders(),
    });
    return await handleResponse<GroupsResponse>(response);
  } catch (error: any) {
    console.error('Error fetching groups:', error);
    throw new Error(error.message || 'Guruhlarni yuklashda xatolik yuz berdi');
  }
};

export const createGroup = async (data: GroupCreateRequest): Promise<GroupResponse> => {
  try {
    const response = await fetch(`${API_URL}/groups`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(data),
    });
    return await handleResponse<GroupResponse>(response);
  } catch (error: any) {
    console.error('Error creating group:', error);
    throw new Error(error.message || 'Guruh qo\'shishda xatolik yuz berdi');
  }
};

export const updateGroup = async (id: number, data: GroupUpdateRequest): Promise<GroupResponse> => {
  try {
    const response = await fetch(`${API_URL}/groups/${id}`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(data),
    });
    return await handleResponse<GroupResponse>(response);
  } catch (error: any) {
    console.error('Error updating group:', error);
    throw new Error(error.message || 'Guruhni yangilashda xatolik yuz berdi');
  }
};

export const deleteGroup = async (id: number): Promise<DeleteResponse> => {
  try {
    const response = await fetch(`${API_URL}/groups/${id}`, {
      method: 'DELETE',
      headers: await getHeaders(),
    });
    return await handleResponse<DeleteResponse>(response);
  } catch (error: any) {
    console.error('Error deleting group:', error);
    throw new Error(error.message || 'Guruhni o\'chirishda xatolik yuz berdi');
  }
};

// Topics
export const fetchCourseTopics = async (courseId: string): Promise<TopicsResponse> => {
  try {
    const response = await fetch(`${API_URL}/topics/course/${courseId}`, {
      method: 'GET',
      headers: await getHeaders(),
    });
    return await handleResponse<TopicsResponse>(response);
  } catch (error: any) {
    console.error('Error fetching topics:', error);
    throw new Error(error.message || 'Mavzularni yuklashda xatolik yuz berdi');
  }
};

export const createTopic = async (data: TopicCreateRequest): Promise<TopicResponse> => {
  try {
    const response = await fetch(`${API_URL}/topics`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(data),
    });
    return await handleResponse<TopicResponse>(response);
  } catch (error: any) {
    console.error('Error creating topic:', error);
    throw new Error(error.message || 'Mavzu yaratishda xatolik yuz berdi');
  }
};

export const updateTopic = async (id: string, data: TopicUpdateRequest): Promise<TopicResponse> => {
  try {
    const response = await fetch(`${API_URL}/topics/${id}`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(data),
    });
    return await handleResponse<TopicResponse>(response);
  } catch (error: any) {
    console.error('Error updating topic:', error);
    throw new Error(error.message || 'Mavzuni yangilashda xatolik yuz berdi');
  }
};

export const deleteTopic = async (id: string): Promise<DeleteResponse> => {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/topics/${id}`, {
      method: 'DELETE',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete topic');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Delete topic error:', error);
    throw new Error('Mavzuni o\'chirishda xatolik yuz berdi');
  }
};

export const reorderTopics = async (data: TopicReorderRequest): Promise<DeleteResponse> => {
  try {
    const response = await fetch(`${API_URL}/topics/reorder`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(data),
    });
    return await handleResponse<DeleteResponse>(response);
  } catch (error: any) {
    console.error('Error reordering topics:', error);
    throw new Error(error.message || 'Mavzular tartibini o\'zgartirishda xatolik yuz berdi');
  }
};