import TelegramWebApp from '@twa-dev/sdk';
import { useEffect, useMemo, useState } from 'react';

import { getPlans } from '@/api/plans';
import airIcon from '@/assets/mini/air.png';
import cameraIcon from '@/assets/mini/camera.png';
import fuelIcon from '@/assets/mini/fuel.png';
import heartIcon from '@/assets/mini/heart.png';
import type { IPlan } from '@/common/types';
import { Text } from '@/components';
import { useUser } from '@/context/UserContext';

import s from './BagPage.module.scss';

type LoadState = 'idle' | 'loading' | 'error' | 'success';

const periodOrder: Record<IPlan['period'], number> = {
  day: 0,
  month: 1,
  year: 2,
};

function formatPeriod(plan: IPlan) {
  return `${plan.periodCount} ${plan.period}`;
}

function getRemainingLabel(subscribedUntil?: string | null) {
  if (!subscribedUntil) return { active: false, label: 'Free' };
  const end = Date.parse(subscribedUntil);
  if (Number.isNaN(end)) return { active: false, label: 'Free' };

  const remainingMs = end - Date.now();
  if (remainingMs <= 0) return { active: false, label: 'Free' };

  const hours = Math.ceil(remainingMs / 3_600_000);
  if (hours < 24) {
    return { active: true, label: `${hours} hours left` };
  }

  const days = Math.ceil(hours / 24);
  return { active: true, label: `${days} days left` };
}

export function BagPage() {
  const { user } = useUser();
  const [state, setState] = useState<LoadState>('idle');
  const [plans, setPlans] = useState<IPlan[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    const fetchPlans = async () => {
      setState('loading');
      setError(null);
      try {
        const data = await getPlans();
        if (!alive) return;
        const sorted = [...data].sort((a, b) => {
          const orderDiff = periodOrder[a.period] - periodOrder[b.period];
          if (orderDiff !== 0) return orderDiff;
          return a.periodCount - b.periodCount;
        });
        setPlans(sorted);
        setSelectedId(sorted[0]?.id ?? null);
        setState('success');
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : 'Failed to load plans');
        setState('error');
      }
    };

    void fetchPlans();

    return () => {
      alive = false;
    };
  }, []);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedId) ?? plans[0],
    [plans, selectedId],
  );

  const remaining = getRemainingLabel(user?.subscribedUntil);

  const featureItems = useMemo(() => {
    const airAmount = selectedPlan?.air ?? 0;
    return [
      { icon: fuelIcon, text: 'Unlimited fuel' },
      { icon: cameraIcon, text: 'All images without blur' },
      { icon: airIcon, text: `${airAmount} AIR` },
      { icon: heartIcon, text: 'Advanced roleplay' },
    ];
  }, [selectedPlan?.air]);

  const handleSubscribe = () => {
    if (!selectedPlan) return;
    const botUsername = import.meta.env.VITE_BOT_USERNAME;
    if (!botUsername) {
      console.error('VITE_BOT_USERNAME is not set');
      return;
    }

    const payload = `subscribe_${selectedPlan.id}`;
    TelegramWebApp.openTelegramLink(
      `https://t.me/${botUsername}?start=${encodeURIComponent(payload)}`,
    );
    TelegramWebApp.close();
  };

  return (
    <div className={s.container}>
      <div className={s.statusCard}>
        <div>
          <div className={s.statusTitle}>Your plan</div>
          <div className={s.statusValue}>
            {remaining.active ? 'Subscribed' : 'Free'}
          </div>
        </div>
        <div className={s.statusDate}>{remaining.label}</div>
      </div>

      {state === 'loading' ? <Text variant="span">Loading...</Text> : null}
      {state === 'error' ? (
        <Text variant="span">{error || 'Failed to load plans'}</Text>
      ) : null}

      {state === 'success' ? (
        <>
          <div className={s.plans}>
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`${s.planCard} ${
                  plan.id === selectedId ? s.selected : ''
                }`}
                onClick={() => setSelectedId(plan.id)}
              >
                <div className={s.planContent}>
                  <div className={s.planRow}>
                    <span className={s.planPeriod}>{formatPeriod(plan)}</span>
                    <span className={s.air}>
                      + {plan.air}
                      <img
                        className={s.airIcon}
                        src={airIcon}
                        alt="air"
                        draggable={false}
                      />
                    </span>
                  </div>
                  <div className={s.planRow}>
                    <div className={s.planPriceRow}>
                      <span className={s.priceAmount}>{plan.price}</span>
                      <span className={s.star}>⭐️</span>
                    </div>
                    <span className={s.planDuration}>
                      / {formatPeriod(plan)}
                    </span>
                  </div>
                </div>
                <div className={s.radio}>
                  <span className={s.radioDot} />
                </div>
              </div>
            ))}
          </div>

          {selectedPlan ? (
            <ul className={s.features}>
              {featureItems.map((feature) => (
                <li key={feature.text} className={s.featureItem}>
                  <img
                    src={feature.icon}
                    alt=""
                    className={s.featureIcon}
                    draggable={false}
                  />
                  <span>{feature.text}</span>
                </li>
              ))}
            </ul>
          ) : null}

          <button className={s.subscribeButton} onClick={handleSubscribe}>
            {remaining.active ? 'Extend' : 'Subscribe'}
          </button>
        </>
      ) : null}
    </div>
  );
}
