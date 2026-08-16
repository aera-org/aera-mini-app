export type SubscriptionRemaining =
  | {
      active: false;
      count?: never;
      key: 'subscription.free';
    }
  | {
      active: true;
      count: number;
      key: 'subscription.hoursLeft' | 'subscription.daysLeft';
    };

export function getSubscriptionRemaining(
  subscribedUntil?: string | null,
  now = Date.now(),
): SubscriptionRemaining {
  if (!subscribedUntil) return { active: false, key: 'subscription.free' };

  const end = Date.parse(subscribedUntil);
  if (Number.isNaN(end)) return { active: false, key: 'subscription.free' };

  const remainingMs = end - now;
  if (remainingMs <= 0) return { active: false, key: 'subscription.free' };

  const remainingHours = remainingMs / 3_600_000;
  if (remainingHours < 24) {
    return {
      active: true,
      count: Math.max(1, Math.ceil(remainingHours)),
      key: 'subscription.hoursLeft',
    };
  }

  return {
    active: true,
    count: Math.max(1, Math.floor(remainingHours / 24)),
    key: 'subscription.daysLeft',
  };
}
