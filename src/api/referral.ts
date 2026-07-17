import type { IReferral } from '@/common/types';

import { apiFetch } from './client';

export async function getReferral(): Promise<IReferral> {
  const response = await apiFetch('/me/referral');
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to load referral');
  }

  const data = (await response.json()) as IReferral | { data: IReferral };
  if (typeof data === 'object' && data && 'data' in data) {
    return data.data;
  }

  return data;
}
