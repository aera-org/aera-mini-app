import { useQuery } from '@tanstack/react-query';
import { createContext, useContext } from 'react';

import { getMe } from '@/api/me';
import type { IUser } from '@/common/types';

export type UserContextValue = {
  user: IUser | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  });

  const refresh = async () => {
    await refetch();
  };

  return (
    <UserContext.Provider
      value={{
        user: data ?? null,
        isLoading,
        error:
          error instanceof Error
            ? error.message
            : error
              ? 'Failed to load user'
              : null,
        refresh,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
