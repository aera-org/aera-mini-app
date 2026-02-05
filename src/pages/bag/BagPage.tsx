import { useQuery, useQueryClient } from '@tanstack/react-query';
import TelegramWebApp from '@twa-dev/sdk';
import { useEffect, useMemo, useState } from 'react';

import { createPlanInvoice } from '@/api/payments';
import { getPlans } from '@/api/plans';
import airIcon from '@/assets/mini/air.png';
import cameraIcon from '@/assets/mini/camera.png';
import fuelIcon from '@/assets/mini/fuel.png';
import heartIcon from '@/assets/mini/heart.png';
import type { IPlan } from '@/common/types';
import { Text } from '@/components';
import { useUser } from '@/context/UserContext';

import s from './BagPage.module.scss';

const periodOrder: Record<IPlan['period'], number> = {
  day: 0,
  month: 1,
  year: 2,
};

function formatPeriod(plan: IPlan) {
  return `${plan.periodCount} ${plan.period}`;
}

function pluralize(count: number, one: string, many: string) {
  return count === 1 ? one : many;
}

function getRemainingLabel(subscribedUntil?: string | null) {
  if (!subscribedUntil) return { active: false, label: 'Free' };
  const end = Date.parse(subscribedUntil);
  if (Number.isNaN(end)) return { active: false, label: 'Free' };

  const remainingMs = end - Date.now();
  if (remainingMs <= 0) return { active: false, label: 'Free' };

  const remainingHours = remainingMs / 3_600_000;
  if (remainingHours < 24) {
    const hours = Math.max(1, Math.ceil(remainingHours));
    return {
      active: true,
      label: `${hours} ${pluralize(hours, 'hour', 'hours')} left`,
    };
  }

  const days = Math.max(1, Math.floor(remainingHours / 24));
  return {
    active: true,
    label: `${days} ${pluralize(days, 'day', 'days')} left`,
  };
}

export function BagPage() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const {
    data: plans = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['plans'],
    queryFn: getPlans,
    select: (data) =>
      [...data].sort((a, b) => {
        const orderDiff = periodOrder[a.period] - periodOrder[b.period];
        if (orderDiff !== 0) return orderDiff;
        return a.periodCount - b.periodCount;
      }),
  });

  useEffect(() => {
    if (plans.length === 0) {
      setSelectedId(null);
      return;
    }
    setSelectedId((current) => {
      if (current && plans.some((plan) => plan.id === current)) {
        return current;
      }
      return plans[0].id;
    });
  }, [plans]);

  useEffect(() => {
    const handler = () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    };
    TelegramWebApp.onEvent('invoiceClosed', handler);
    return () => {
      TelegramWebApp.offEvent('invoiceClosed', handler);
    };
  }, [queryClient]);

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
    void (async () => {
      try {
        const invoiceLink = await createPlanInvoice(selectedPlan.id);
        TelegramWebApp.openInvoice(invoiceLink, (status) => {
          if (status === 'paid') {
            queryClient.invalidateQueries({ queryKey: ['me'] });
          }
        });
      } catch (err) {
        console.error(err);
      }
    })();
  };

  return (
    <div className={s.container}>
      <div className={s.statusCard}>
        <div>
          <div className={s.statusTitle}>Your plan</div>
          <div className={s.statusValue}>
            {remaining.active ? 'Subscribed' : ''}
          </div>
        </div>
        <div className={s.statusDate}>{remaining.label}</div>
      </div>

      {isLoading ? (
        <Text variant="span" center>
          Loading...
        </Text>
      ) : null}
      {isError ? (
        <Text variant="span">
          {error instanceof Error ? error.message : 'Failed to load plans'}
        </Text>
      ) : null}

      {!isLoading && !isError ? (
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
