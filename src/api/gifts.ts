import type { IGift } from '@/common/types';

import { apiFetch } from './client';

export async function getGifts(): Promise<IGift[]> {
  const response = await apiFetch('/gifts');
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to load gifts');
  }

  const data = (await response.json()) as IGift[] | { data: IGift[] };
  if (Array.isArray(data)) {
    return data;
  }

  return data.data;
}
