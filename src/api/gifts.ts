import type { IGift } from '@/common/types';

import { apiFetch } from './client';

export type BuyGiftResult = {
  success: boolean;
  shouldClose: boolean;
};

export async function getGifts(): Promise<IGift[]> {
  const response = await apiFetch('/gifts');
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to load gifts');
  }

  const data = (await response.json()) as IGift[] | { data: IGift[] };
  if (Array.isArray(data)) {
    return data.sort((a, b) => a.name.localeCompare(b.name));
  }

  return data.data;
}

export async function buyGift(giftId: string): Promise<BuyGiftResult> {
  const response = await apiFetch(`/gifts/${giftId}/buy`, {
    method: 'POST',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to buy gift');
  }

  return (await response.json()) as BuyGiftResult;
}

export async function sendGift(giftId: string): Promise<void> {
  const response = await apiFetch(`/gifts/${giftId}/gift`, {
    method: 'POST',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to gift');
  }
}
