import { createContext, useContext, useMemo, useState } from 'react';

import type { LaunchParams } from '@/common/types';

const STORAGE_KEY = 'aera_launch_params';

type LaunchParamsContextValue = {
  params: LaunchParams;
};

const LaunchParamsContext = createContext<LaunchParamsContextValue | undefined>(
  undefined
);

function normalizeValue(value: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function readFromUrl(): LaunchParams | null {
  if (typeof window === 'undefined') return null;
  const search = new URLSearchParams(window.location.search);
  const characterName = normalizeValue(search.get('character'));
  const scenarioId = normalizeValue(search.get('scenario'));
  if (!characterName && !scenarioId) return null;
  return { characterName, scenarioId };
}

function readFromStorage(): LaunchParams | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LaunchParams;
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      characterName: normalizeValue(parsed.characterName ?? null),
      scenarioId: normalizeValue(parsed.scenarioId ?? null),
    };
  } catch {
    return null;
  }
}

function writeToStorage(params: LaunchParams) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(params));
  } catch {
    // ignore storage errors
  }
}

export function LaunchParamsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [params] = useState<LaunchParams>(() => {
    const fromUrl = readFromUrl();
    if (fromUrl) {
      writeToStorage(fromUrl);
      return fromUrl;
    }
    const fromStorage = readFromStorage();
    return fromStorage ?? {};
  });

  const value = useMemo(() => ({ params }), [params]);

  return (
    <LaunchParamsContext.Provider value={value}>
      {children}
    </LaunchParamsContext.Provider>
  );
}

export function useLaunchParams() {
  const context = useContext(LaunchParamsContext);
  if (!context) {
    throw new Error('useLaunchParams must be used within LaunchParamsProvider');
  }
  return context.params;
}
