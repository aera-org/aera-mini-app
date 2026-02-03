import apiClient from './axios';
import { TonProof, WalletResponse } from '../types/ton';

interface TonAccount {
  address: string;
  walletStateInit: string;
  chain?: string;
}
export const walletApi = {
  async generateNonce(): Promise<string> {
    const { data } = await apiClient.get<{ nonce: string }>('/ton/generate-nonce');
    return data.nonce;
  },

  async connectWallet(
    proof: TonProof,
    account: TonAccount,
    userId: string
  ): Promise<WalletResponse> {
    const { data } = await apiClient.post<WalletResponse>('/ton/wallet', {
      proof,
      account,
      userId,
    });
    return data;
  },

  async getWallet() {
    const { data } = await apiClient.get<WalletResponse>('/ton/wallet');
    return data;
  },
};

export interface TonWalletHistory {
  id: string;
  amount: number;
  timestamp: Date;
  type: 'credit' | 'debit';
}
