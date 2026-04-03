import type { CharacterType, ICharacter } from '@/common/types';

import { apiFetch } from './client';

export async function getGirls(type?: CharacterType): Promise<ICharacter[]> {
  const query = type ? `?type=${encodeURIComponent(type)}` : '';
  const response = await apiFetch(`/characters${query}`);
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
