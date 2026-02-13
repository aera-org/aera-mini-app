import { useQuery, useQueryClient } from '@tanstack/react-query';
import TelegramWebApp from '@twa-dev/sdk';
import { useEffect, useMemo, useState } from 'react';

import { createPlanInvoice } from '@/api/payments';
import { getPlans } from '@/api/plans';
import airIcon from '@/assets/mini/air.png';
import { type IPlan, PlanPeriod, PlanType } from '@/common/types';
import { Loader, Text } from '@/components';
import { useLaunchParams } from '@/context/LaunchParamsContext';
import { useUser } from '@/context/UserContext';

import s from './BagPage.module.scss';

const periodOrder: Record<PlanPeriod, number> = {
  [PlanPeriod.Day]: 0,
  [PlanPeriod.Month]: 1,
  [PlanPeriod.Year]: 2,
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
  const launchParams = useLaunchParams();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const {
    data: plans = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['plans', PlanType.Subscription],
    queryFn: () => getPlans(PlanType.Subscription),
    select: (data) =>
      [...data].sort((a, b) => {
        const orderA = a.period ? periodOrder[a.period] : 0;
        const orderB = b.period ? periodOrder[b.period] : 0;
        const orderDiff = orderA - orderB;
        if (orderDiff !== 0) return orderDiff;
        return (a.periodCount ?? 0) - (b.periodCount ?? 0);
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
  const featureItems = selectedPlan?.items ?? [];

  const handleSubscribe = () => {
    if (!selectedPlan) return;
    void (async () => {
      try {
        const invoiceLink = await createPlanInvoice(
          selectedPlan.id,
          launchParams,
        );
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
        <Loader />
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
                } ${plan.isRecommended ? s.recommended : ''}`}
                onClick={() => setSelectedId(plan.id)}
              >
                {plan.isRecommended ? (
                  <span className={s.recommendedBadge}>Most Popular</span>
                ) : null}
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
              {featureItems.map((feature, index) => (
                <li
                  key={`${feature.emoji}-${feature.value}-${index}`}
                  className={s.featureItem}
                >
                  <span className={s.featureEmoji} aria-hidden>
                    {feature.emoji}
                  </span>
                  <span>{feature.value}</span>
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
