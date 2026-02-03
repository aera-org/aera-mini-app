import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

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
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMe();
      setUser(data);
    } catch (err) {
      setUser(null);
      setError(err instanceof Error ? err.message : 'Failed to load user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <UserContext.Provider value={{ user, isLoading, error, refresh }}>
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
