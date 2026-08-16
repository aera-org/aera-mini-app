import { createContext, useContext } from 'react';

import type { IUser } from '@/common/types';

export type UserContextValue = {
  user: IUser | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export const UserContext = createContext<UserContextValue | undefined>(
  undefined,
);

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
