import { apiFetch } from './client';
import type { ITgUser } from '@/common/types';

export async function getMe(): Promise<ITgUser> {
  const response = await apiFetch('/me');
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to load user');
  }

  const data = (await response.json()) as ITgUser | { data: ITgUser };
  if (typeof data === 'object' && data && 'data' in data) {
    return (data as { data: ITgUser }).data;
  }
  return data as ITgUser;
}
