import type { LaunchParams } from '@/common/types';

import { apiFetch } from './client';

export async function createPlanInvoice(
  planId: string,
  params?: LaunchParams
): Promise<string> {
  const payload: {
    planId: string;
    characterName?: string;
    scenarioId?: string;
  } = {
    planId,
  };
  if (params?.characterName) payload.characterName = params.characterName;
  if (params?.scenarioId) payload.scenarioId = params.scenarioId;

  const response = await apiFetch('/payments/invoice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to create invoice');
  }

  const data = (await response.json()) as { invoiceLink: string };
  return data.invoiceLink;
}
