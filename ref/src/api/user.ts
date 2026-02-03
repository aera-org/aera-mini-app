import apiClient from './axios';
import { logger } from '../utils/logger';

interface Referral {
  name: string;
  jumps: number;
}

interface ReferralsResponse {
  referrals: Referral[];
  referralCount: number;
}

interface ApiResponse {
  success: boolean;
  message?: string;
}

export const userApi = {
  selectGirl: async (girl: string): Promise<ApiResponse> => {
    try {
      const { data } = await apiClient.post('/user/select-girl', { girl });
      return { success: true, ...data };
    } catch (error) {
      logger.error('Failed to select girl', { error: String(error) });
      return { success: false, message: 'Failed to select girl' };
    }
  },
};

export const getReferrals = async (): Promise<ReferralsResponse> => {
  try {
    const response = await apiClient.get(`/user/referrals`);
    return response.data;
  } catch (error) {
    logger.error('Failed to get referrals', { error: String(error) });
    throw error;
  }
};
