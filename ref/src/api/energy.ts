import apiClient from './axios';

interface EnergyResponse {
  energy: {
    value: number;
    lastUpdate: string;
  };
  amount: number;
}

interface BoostResponse {
  boost: {
    value: number;
    lastUpdate: string;
    resetAfter: string;
  };
  ok: boolean;
  reason?: 'BOOST_ALREADY_ACTIVE' | 'NO_BOOSTS_REMAINING' | 'SERVER_ERROR';
}

export const energyApi = {
  async convertEnergy(regular: number, boost: number, undress: number): Promise<EnergyResponse> {
    const { data } = await apiClient.post<EnergyResponse>('energy/convert', {
      regular,
      boost,
      undress,
    });
    return data;
  },
  async boostEnergy(): Promise<BoostResponse> {
    const { data } = await apiClient.post<BoostResponse>("energy/boost", {});
    return data;
  },
};
