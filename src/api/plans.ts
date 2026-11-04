import type { IPlan, IPlanBundles, PlanType } from '@/common/types';

import { apiFetch } from './client';

export async function getPlans(type?: PlanType): Promise<IPlan[]> {
  const query = type ? `?type=${encodeURIComponent(type)}` : '';
  const response = await apiFetch(`/plans${query}`);
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

export async function getPlanBundles(): Promise<IPlanBundles> {
  const response = await apiFetch('/plans/bundles');
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to load bundles');
  }

  const data = (await response.json()) as IPlanBundles | { data: IPlanBundles };
  if ('plans' in data) {
    return data;
  }

  return data.data;
}

export function isNoBundlesError(error: unknown) {
  return error instanceof Error && error.message.includes('NO_BUNDLES');
}
