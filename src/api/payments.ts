import { apiFetch } from './client';

export async function createPlanInvoice(planId: string): Promise<string> {
  const response = await apiFetch('/payments/invoice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to create invoice');
  }

  const data = (await response.json()) as { invoiceLink: string };
  return data.invoiceLink;
}
