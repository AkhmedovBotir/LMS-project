import { ApiResponse } from '../../types/api';
import { TeacherGroup } from '../../types/group';
import { api } from './api';

export const fetchMyGroups = async () => {
  try {
    const response = await api.get<ApiResponse<TeacherGroup[]>>('/mobile/employees/my-groups');
    return response.data;
  } catch (error: any) {
    throw error;
  }
}; 