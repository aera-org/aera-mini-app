import type { IUser, Language, PlanType } from '@/common/types';

import { apiFetch, localFetch } from './client';

type MeDeeplinkDto = {
  ref: string;
  postId: string;
  type: 'cc';
};

type PaywallOpenDto = {
  type: PlanType.Subscription | PlanType.Air;
  chatId: string;
};

type PatchMeDto = {
  languageUI?: Language;
};

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

export async function postMeDeeplink(body: MeDeeplinkDto): Promise<void> {
  const response = await apiFetch('/me/deeplink', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to post deeplink');
  }
}

export async function patchMe(body: PatchMeDto): Promise<void> {
  const response = await apiFetch('/me', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to update user');
  }
}

export async function postPaywallOpen(body: PaywallOpenDto): Promise<void> {
  const response = await apiFetch('/me/paywall-open', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to post paywall open');
  }
}

export async function patchMeCountryOnce(): Promise<void> {
  const response = await localFetch('/api/me-country', { method: 'PATCH' });
  if (!response.ok && response.status !== 204) {
    const text = await response.text().catch(() => '');
    throw new Error(text || 'Failed to patch country');
  }
}
