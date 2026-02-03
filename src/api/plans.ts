import type { IPlan } from '@/common/types';

import { apiFetch } from './client';

export async function getPlans(): Promise<IPlan[]> {
  const response = await apiFetch('/plans');
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to load plans');
  }

  const data = (await response.json()) as IPlan[] | { data: IPlan[] };
  if (Array.isArray(data)) {
    return data;
  }

  return data.data;
}
