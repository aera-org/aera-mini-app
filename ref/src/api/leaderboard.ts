import apiClient from './axios';

interface Leader {
  name: string;
  amount: number;
}

interface LeaderboardResponse {
  leaders: Leader[];
  position: number;
  totalJumps: number;
}

export const leaderboardApi = {
  async getList(): Promise<LeaderboardResponse> {
    const { data } = await apiClient.get<LeaderboardResponse>('/leaderboard');
    return data;
  },
};
