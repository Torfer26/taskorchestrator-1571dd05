export interface Task {
  id: number;
  label: string;
  color: string;
  start: number;
  end: number;
  assignee?: string;
  completion_status: 'pending' | 'in_progress' | 'completed';
  dependencies: string;
  start_date: string;
  end_date: string;
  duration: number;
}