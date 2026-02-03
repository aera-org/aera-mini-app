import type { IUser } from '@/common/types';

import { apiFetch } from './client';

export async function getMe(): Promise<IUser> {
  const response = await apiFetch('/me');
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to load user');
  }

  const data = (await response.json()) as IUser | { data: IUser };
  if (typeof data === 'object' && data && 'data' in data) {
    return (data as { data: IUser }).data;
  }
  return data as IUser;
}
