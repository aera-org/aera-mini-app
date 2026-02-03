import apiClient from './axios';
import { TasksResponse, TaskCompletionResponse } from '../types/task';

export const tasksApi = {
  async getTasks(): Promise<TasksResponse> {
    const { data } = await apiClient.get<TasksResponse>('/tasks');
    return data;
  },

  async completeTask(taskId: string): Promise<TaskCompletionResponse> {
    const { data } = await apiClient.post<TaskCompletionResponse>(
      '/tasks',
      {
        task: taskId,
      }
    );
    return data;
  },
};
