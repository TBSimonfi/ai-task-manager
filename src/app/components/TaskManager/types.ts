export interface SubTask {
  id: string;
  content: string;
  completed: boolean;
}

export interface Task {
  id: number;
  created_at: string;
  content: string;
  status: string;
  category?: string;
  priority?: number;
  due_date?: string;
  description?: string;
  sub_tasks?: SubTask[];
  estimated_hours?: number;
  project_name?: string;
  is_archived: boolean;
  depends_on?: number[];
  tags?: string[];
}

export interface Activity {
  id: number;
  task_id?: number;
  action: string;
  details?: string;
  created_at: string;
}

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}
