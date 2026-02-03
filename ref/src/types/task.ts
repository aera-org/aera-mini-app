export interface Task {
  _id: string;
  category: 'premium' | 'daily' | 'referral' | 'channel';
  name: string;
  description: string;
  enabled: boolean;
  isCompleted: boolean;
  priority: number;
  type: 'one_time' | string;
  check: string;
  reward: number;
  data: Record<string, any>;
}

export interface TaskCategory {
  _id: string;
  tasks: Task[];
}

export interface TaskCompletionResponse {
  ok: boolean;
  message?: string;
  error?: string;
  redirect?: string;
}

export interface TasksResponse {
  categories: TaskCategory[];
}
