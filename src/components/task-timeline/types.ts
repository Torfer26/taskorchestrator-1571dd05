export interface Task {
  id: number;
  label: string;
  color: string;
  start: number;  // Día del mes (1-31)
  end: number;    // Día del mes (1-31)
  assignee?: string;
  completion_status?: 'pending' | 'in_progress' | 'completed';
}