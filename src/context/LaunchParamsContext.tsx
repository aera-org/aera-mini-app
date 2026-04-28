import TelegramWebApp from '@twa-dev/sdk';
import { useMemo, useState } from 'react';

import type { LaunchParams } from '@/common/types';

import { LaunchParamsContext } from './launch-params-context';

const STORAGE_KEY = 'aera_launch_params';

function normalizeValue(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function readFromRuntime(): LaunchParams | null {
  if (typeof window === 'undefined') return null;
  const search = new URLSearchParams(window.location.search);
  const characterName = normalizeValue(search.get('character'));
  const scenarioId = normalizeValue(search.get('scenario'));
  const startParam = normalizeValue(
    TelegramWebApp.initDataUnsafe?.start_param ??
      search.get('start_param') ??
      search.get('tgWebAppStartParam') ??
      search.get('startapp'),
  );
  if (!characterName && !scenarioId && !startParam) return null;
  return { characterName, scenarioId, startParam };
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
      startParam: normalizeValue(parsed.startParam ?? null),
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
    const fromRuntime = readFromRuntime();
    if (fromRuntime) {
      writeToStorage(fromRuntime);
      return fromRuntime;
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
