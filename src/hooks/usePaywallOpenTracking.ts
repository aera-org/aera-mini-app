import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { postPaywallOpen } from '@/api/me';
import type { PlanType } from '@/common/types';

type PaywallOpenType = PlanType.Subscription | PlanType.Air;

const trackedPaywallOpens = new Set<string>();

export function usePaywallOpenTracking(type: PaywallOpenType) {
  const location = useLocation();

  useEffect(() => {
    const chatId = new URLSearchParams(location.search).get('chat')?.trim();
    if (!chatId) return;

    const trackingKey = `${location.key}:${type}:${chatId}`;
    if (trackedPaywallOpens.has(trackingKey)) return;

    trackedPaywallOpens.add(trackingKey);
    void postPaywallOpen({ type, chatId }).catch((error) => {
      console.error(error);
    });
  }, [location.key, location.search, type]);
}
