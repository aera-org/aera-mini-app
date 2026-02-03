export interface UserData {
  energy: {
    value: number;
    lastUpdate: string;
  };
  boost: {
    value: number;
    lastUpdate: string;
    resetAfter: string;
  };
  recharge: {
    value: number;
    lastUpdate: string;
    resetAfter: string;
  };
  assets: {
    gym: {
      level: number;
      visual: string;
    };
    ball: {
      level: number;
      visual: string;
    };
  };
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  girl: string;
  undressDate: string | null;
  inventory?: {
    girls?: Array<{
      name: string;
      description?: string;
      bot_username?: string;
      s3_files?: {
        store_image?: {
          key: string;
          exists: boolean;
        };
        store_image_transparent?: {
          key: string;
          exists: boolean;
        };
      };
    }>;
    [key: string]: unknown;
  };
}

export interface User {
  _id: string;
  id: number;
  data: UserData;
  __v: number;
  ai_fuel: number;
  allows_write_to_pm: boolean;
  createdAt: string;
  first_name?: string;
  is_premium: boolean;
  jumps: number;
  language_code?: string;
  last_name?: string;
  photo_url: string;
  updatedAt: string;
  username?: string;
  subscription_expires_at: string;
  referrer?: string;
  deeplink?: string;
}

export interface UserContextType {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  fetchWalletHistory?: () => Promise<void>;
  updateUser?: () => Promise<void>;
  updateUserImmediate?: () => Promise<void>;
  fetchUser?: () => Promise<void>;
}
