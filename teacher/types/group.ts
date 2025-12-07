export interface CourseInfo {
  id: number;
  name: string;
  description: string;
  duration_months: number;
  price: string;
}

export interface Course {
  _id: string;
  name: string;
  id: string;
}

export interface TeacherGroup {
  _id: string;
  name: string;
  time: string;
  days: string;
  course_id: Course;
  teacher_id: string;
  status: 'active' | 'inactive';
  start_date: string;
  end_date: string;
  createdAt: string;
  updatedAt: string;
  id: string;
}

export interface Group {
  id: number;
  name: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface GroupsResponse {
  success: boolean;
  data: Group[];
  message?: string;
}

export interface GroupResponse {
  success: boolean;
  data: Group;
  message?: string;
}

export interface GroupCreateRequest {
  name: string;
  status?: 'active' | 'inactive';
}

export interface GroupUpdateRequest {
  name?: string;
  status?: 'active' | 'inactive';
} 