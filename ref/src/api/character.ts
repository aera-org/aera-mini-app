import apiClient from './axios';
import { Character } from '../types/character';
import { logger } from '../utils/logger';

export const characterApi = {
  async getAllCharacters(): Promise<Character[]> {
    try {
      const { data } = await apiClient.get<Character[]>('/characters/all');
      return data;
    } catch (error) {
      logger.error('Failed to get all characters', { error: String(error) });
      throw error;
    }
  },
};
