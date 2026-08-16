import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { getMe, patchMeCountryOnce } from '@/api/me';
import i18n from '@/i18n/config';

import { UserContext } from './user-context';

const countryPatchKey = 'country-patch-session-v1';

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(countryPatchKey)) return;
    sessionStorage.setItem(countryPatchKey, '1');
    void patchMeCountryOnce().catch(() => {});
  }, []);

  useEffect(() => {
    if (!data?.languageUI) return;
    if (i18n.language === data.languageUI) return;

    void i18n.changeLanguage(data.languageUI);
  }, [data?.languageUI]);

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
