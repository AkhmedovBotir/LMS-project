import { ApiResponse } from '../../types/api';
import { Topic } from '../../types/topic';
import { api } from './api';

export const fetchCourseTopics = async (courseId: string) => {
  try {
    const response = await api.get<ApiResponse<Topic[]>>(`/mobile/courses/${courseId}/topics`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Kurs topilmadi');
    }
    throw error;
  }
}; 