export interface TonProof {
  name: string;
  payload: string;
}

export interface TonAccount {
  address: string;
  network: string;
  walletStateInit: string;
  friendly_address?: string;
}

export interface WalletResponse {
  success: boolean;
  wallet: Wallet;
}

export interface Wallet {
  wallet_address: string;
}
