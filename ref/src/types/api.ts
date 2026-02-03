// API specific types

export interface ApiErrorResponse {
  message: string;
  code: number;
  details?: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiFailureResponse {
  success: false;
  message: string;
  code?: number;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiFailureResponse;

// User API types
export interface UserApiResponse {
  _id: string;
  id: number;
  __v: number;
  ai_fuel: number;
  allows_write_to_pm: boolean;
  createdAt: string;
  first_name: string;
  is_premium: boolean;
  jumps: number;
  language_code: string;
  last_name: string;
  photo_url: string;
  updatedAt: string;
  username: string;
  undressDate: string;
  subscription_expires_at: string;
  referrer?: string;
}

// Chat API types
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

export interface ChatApiRequest {
  chat_id: number;
  bot_name: string;
  message: string;
}

export interface ChatApiResponse {
  messages: ChatMessage[];
  options?: string[];
}

// Task API types
export interface TaskApiResponse {
  _id: string;
  name: string;
  description: string;
  category: string;
  reward: number;
  status: 'pending' | 'completed';
}

export interface TaskCategoryApiResponse {
  _id: string;
  name: string;
  tasks: TaskApiResponse[];
}

export interface TaskStatusResponse {
  ok: boolean;
  message?: string;
  error?: string;
  redirect?: string;
}

// Payment API types
export interface PaymentInvoiceRequest {
  request: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentInvoiceResponse {
  success: boolean;
  invoice?: string;
  payload?: string;
  message?: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  message: string;
  status: 'pending' | 'completed' | 'failed';
}

// Leaderboard API types
export interface LeaderboardEntry {
  name: string;
  amount: number;
  position: number;
}

export interface LeaderboardApiResponse {
  leaders: LeaderboardEntry[];
  position: number;
  totalAmount: number;
}

// Referrals API types
export interface ReferralApiResponse {
  name: string;
  reward: number;
}

export interface ReferralsApiResponse {
  referrals: ReferralApiResponse[];
  referralCount: number;
}

// Wallet API types
export interface WalletConnectRequest {
  proof: string;
  account: {
    address: string;
    chain: string;
  };
  userId: string;
}

export interface WalletConnectResponse {
  success: boolean;
  message: string;
  walletAddress?: string;
}

// Energy API types
export interface EnergyApiResponse {
  value: number;
  lastUpdate: string;
  resetAfter?: string;
}

// Boost API types
export interface BoostApiResponse {
  value: number;
  lastUpdate: string;
  resetAfter: string;
}

// Gift API types
export interface GiftApiResponse {
  id: string;
  name: string;
  price: number;
  currency: 'XTR' | 'JUMPS';
  image: string;
  description?: string;
}

// Store API types
export interface StoreItemApiResponse {
  id: string;
  name: string;
  price: number;
  currency: 'XTR' | 'JUMPS';
  image: string;
  description?: string;
  category: string;
}

// Messages API types
export interface MessageApiRequest {
  chat_id: number;
  bot_name: string;
  message: string;
  metadata?: Record<string, unknown> | null;
  actions?: Record<string, unknown> | null;
}

export interface MessageApiResponse {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  options?: string[];
}
