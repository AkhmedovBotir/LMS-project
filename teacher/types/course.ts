export interface Group {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'inactive';
}

export interface Course {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  topics_count: number;
  created_at: string;
  updated_at: string;
  groups: Group[];
}

export interface CoursesResponse {
  success: boolean;
  message?: string;
  data: Course[];
}

export interface CourseResponse {
  success: boolean;
  message?: string;
  data: Course;
} 