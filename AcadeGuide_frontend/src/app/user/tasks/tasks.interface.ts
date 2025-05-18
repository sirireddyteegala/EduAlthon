export interface Task {
  id?: number;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  title: string;
  description?: string;
  due_date?: string;
  status: 'todo' | 'completed';
  priority: 'low' | 'medium' | 'high';
} 