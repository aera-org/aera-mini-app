import type { ICharacter } from '@/common/types';

import { apiFetch } from './client';

export async function getGirls(): Promise<ICharacter[]> {
  const response = await apiFetch('/characters');
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to load girls');
  }

  const data = (await response.json()) as ICharacter[] | { data: ICharacter[] };
  if (Array.isArray(data)) {
    return data;
  }

  return data.data;
}
