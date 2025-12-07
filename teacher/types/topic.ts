export interface Course {
  _id: string;
  name: string;
  id: string;
}

export interface Topic {
  _id: string;
  course_id: Course;
  title: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  __v: number;
  id: string;
}

export interface TopicCreateRequest {
  course_id: string;
  title: string;
}

export interface TopicUpdateRequest {
  title: string;
  status: 'active' | 'inactive';
}

export interface TopicReorderRequest {
  topics: {
    id: string;
    order_number: number;
  }[];
}

export interface TopicsResponse {
  success: boolean;
  message?: string;
  data: Topic[];
}

export interface TopicResponse {
  success: boolean;
  message?: string;
  data: Topic;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
} 