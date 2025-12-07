import { ApiResponse, CreateTermRequest, CreateTestQuestionRequest, CreateWrittenQuestionRequest, Term, TestQuestion, UpdateTermRequest, UpdateTestQuestionRequest, UpdateWrittenQuestionRequest, WrittenQuestion } from '../../types/question';
import { api } from './api';

// Written Questions
export const fetchWrittenQuestions = async (params?: {
  page?: number;
  limit?: number;
  topic_id?: string;
  created_by?: string;
  status?: boolean;
  search?: string;
}) => {
  const response = await api.get<ApiResponse<WrittenQuestion[]>>('/questions/written', { params });
  return response.data;
};

export const fetchWrittenQuestion = async (id: string) => {
  const response = await api.get<ApiResponse<WrittenQuestion>>(`/questions/written/${id}`);
  return response.data;
};

export const createWrittenQuestion = async (data: CreateWrittenQuestionRequest) => {
  const response = await api.post<ApiResponse<WrittenQuestion>>('/questions/written', data);
  return response.data;
};

export const updateWrittenQuestion = async (id: string, data: UpdateWrittenQuestionRequest) => {
  const response = await api.put<ApiResponse<WrittenQuestion>>(`/questions/written/${id}`, data);
  return response.data;
};

export const deleteWrittenQuestion = async (id: string) => {
  const response = await api.delete<ApiResponse<null>>(`/questions/written/${id}`);
  return response.data;
};

// Test Questions
export const fetchTestQuestions = async (params?: {
  page?: number;
  limit?: number;
  topic_id?: string;
  created_by?: string;
  status?: boolean;
  search?: string;
}) => {
  const response = await api.get<ApiResponse<TestQuestion[]>>('/questions/test', { params });
  return response.data;
};

export const fetchTestQuestion = async (id: string) => {
  const response = await api.get<ApiResponse<TestQuestion>>(`/questions/test/${id}`);
  return response.data;
};

export const createTestQuestion = async (data: CreateTestQuestionRequest) => {
  const response = await api.post<ApiResponse<TestQuestion>>('/questions/test', data);
  return response.data;
};

export const updateTestQuestion = async (id: string, data: UpdateTestQuestionRequest) => {
  const response = await api.put<ApiResponse<TestQuestion>>(`/questions/test/${id}`, data);
  return response.data;
};

export const deleteTestQuestion = async (id: string) => {
  const response = await api.delete<ApiResponse<null>>(`/questions/test/${id}`);
  return response.data;
};

// Terms
export const fetchTerms = async (params?: {
  page?: number;
  limit?: number;
  topic_id?: string;
  created_by?: string;
  status?: string;
  search?: string;
}) => {
  const response = await api.get<ApiResponse<Term[]>>('/questions/terms', { params });
  return response.data;
};

export const fetchTerm = async (id: string) => {
  const response = await api.get<ApiResponse<Term>>(`/questions/terms/${id}`);
  return response.data;
};

export const createTerm = async (data: CreateTermRequest) => {
  const response = await api.post<ApiResponse<Term>>('/questions/terms', data);
  return response.data;
};

export const updateTerm = async (id: string, data: UpdateTermRequest) => {
  const response = await api.put<ApiResponse<Term>>(`/questions/terms/${id}`, data);
  return response.data;
};

export const deleteTerm = async (id: string) => {
  const response = await api.delete<ApiResponse<null>>(`/questions/terms/${id}`);
  return response.data;
}; 