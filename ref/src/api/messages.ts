import apiClient from './axios';

export interface Message {
  type: string;
  content: string;
  metadata: Record<string, unknown> | null;
  actions: Record<string, unknown> | null;
}

export interface User {
  chat_id: number;
  fuel: number;
  coins: number;
}

export interface Bot {
  name: string;
}

export interface SendMessageResponse {
  success: boolean;
  messages: Message[];
  user: User;
  bot: Bot;
  options?: string[];
}

export interface SendMessageRequest {
  chat_id: number;
  bot_name: string;
  message: string;
}

export const sendMessage = async (
  data: SendMessageRequest
): Promise<SendMessageResponse> => {
  const response = await apiClient.post<SendMessageResponse>('/messages', data);
  return response.data;
};
