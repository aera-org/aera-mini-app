import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
} from 'react';

import TelegramWebApp from '@twa-dev/sdk';
import apiClient from '../api/axios';
import { User, UserContextType, UserData } from '../types/user';
import ReactGA from 'react-ga4';
import { logger } from '../utils/logger';
import { UserApiResponse } from '../types/api';
import { createRenderLogger } from '../utils/renderProfiler';

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  setUser: () => {},
  fetchUser: async () => {},
  updateUser: async () => {},
});

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const lastUpdateRef = useRef<string>('');
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Render tracking in development
  const renderLogger = useMemo(() => createRenderLogger('UserProvider'), []);

  useEffect(() => {
    renderLogger.logRender(
      `User: ${user ? 'loaded' : 'null'}, Loading: ${isLoading}`
    );
  }, [user, isLoading, renderLogger]);

  const fetchUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const initData = TelegramWebApp.initData;
      const headers: {
        headers: {
          'web-app-init-data'?: string;
        };
      } = {
        headers: {},
      };

      if (initData) {
        headers.headers['web-app-init-data'] = initData;
      }

      const { data: userData } = await apiClient.get<UserApiResponse>(
        '/user',
        headers
      );

      const { data } = await apiClient.get<UserData>('/user/data', headers);

      const newUser = { ...userData, data };
      const newUpdateTime = newUser.updatedAt || new Date().toISOString();

      // Only update if data actually changed
      if (lastUpdateRef.current !== newUpdateTime) {
        lastUpdateRef.current = newUpdateTime;
        setUser(newUser);
      }
    } catch (error) {
      logger.error('Failed to fetch user data', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      // Don't set user to null on error to preserve existing state
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  }, []);

  // Debounced update to prevent too frequent updates
  const updateUser = useCallback(async () => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    fetchTimeoutRef.current = setTimeout(async () => {
      await fetchUser();
      fetchTimeoutRef.current = null;
    }, 1000); // Debounce for 1 second
  }, [fetchUser]);

  // Immediate update for critical changes (payments, etc)
  const immediateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const updateUserImmediate = useCallback(async () => {
    // Clear any existing timeouts
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = null;
    }
    if (immediateTimeoutRef.current) {
      clearTimeout(immediateTimeoutRef.current);
    }

    // Debounce immediate updates by 200ms to prevent rapid-fire calls
    immediateTimeoutRef.current = setTimeout(async () => {
      await fetchUser();
      immediateTimeoutRef.current = null;
    }, 200);
  }, [fetchUser]);

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user) {
      ReactGA.set({ user_id: user._id });

      if (user.referrer) {
        ReactGA.set({ referral_id: user.referrer });
      }
    }
  }, [user]);

  // Memoize context value to prevent unnecessary rerenders
  const contextValue = useMemo(
    () => ({
      user,
      isLoading,
      setUser: (newUser: User | null) => {
        // Only update if user actually changed using shallow comparison for performance
        setUser((prevUser) => {
          // Quick reference check first
          if (prevUser === newUser) {
            return prevUser;
          }

          // If both are null or both are same object, no update needed
          if (!prevUser && !newUser) {
            return prevUser;
          }

          // Deep comparison only for important fields to avoid expensive JSON.stringify
          if (prevUser && newUser) {
            const hasChanged =
              prevUser._id !== newUser._id ||
              prevUser.updatedAt !== newUser.updatedAt ||
              prevUser.jumps !== newUser.jumps ||
              prevUser.ai_fuel !== newUser.ai_fuel ||
              prevUser.data?.energy?.value !== newUser.data?.energy?.value ||
              prevUser.data?.girl !== newUser.data?.girl ||
              JSON.stringify(prevUser.data?.inventory?.girls) !==
                JSON.stringify(newUser.data?.inventory?.girls);

            if (!hasChanged) {
              return prevUser; // Return same reference if no meaningful changes
            }
          }

          setIsLoading(false);
          renderLogger.logRender('User data updated');
          return newUser;
        });
      },
      updateUser,
      updateUserImmediate,
      fetchUser,
    }),
    [user, isLoading, updateUser, updateUserImmediate, fetchUser]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
