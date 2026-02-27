import { useQuery, useQueryClient } from '@tanstack/react-query';
import TelegramWebApp from '@twa-dev/sdk';
import { useEffect, useMemo, useState } from 'react';

import { createPlanInvoice } from '@/api/payments';
import { getPlans } from '@/api/plans';
import { CheckIcon, MinusIcon, TgStarIcon, TgStarWhiteIcon } from '@/assets/icons';
import airIcon from '@/assets/mini/air.png';
import { PlanFeaturesA, PlanFeaturesB } from '@/common/consts';
import { type IPlan, PlanPeriod, PlanType } from '@/common/types';
import { Card, Loader, Typography } from '@/components';
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

function getDefaultPlan(plans: IPlan[]) {
  return plans.find((plan) => plan.isRecommended) ?? plans[0];
}

function getPlanDays(plan: IPlan) {
  const count = Math.max(1, plan.periodCount ?? 1);
  switch (plan.period) {
    case PlanPeriod.Day:
      return count;
    case PlanPeriod.Month:
      return count * 30;
    case PlanPeriod.Year:
      return count * 365;
    default:
      return count;
  }
}

function getDailyPrice(plan: IPlan) {
  return plan.price / getPlanDays(plan);
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
      return getDefaultPlan(plans)?.id ?? null;
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
    () => plans.find((plan) => plan.id === selectedId) ?? getDefaultPlan(plans),
    [plans, selectedId],
  );
  const selectedPlanIndex = useMemo(() => {
    if (!selectedPlan) return 0;
    const index = plans.findIndex((plan) => plan.id === selectedPlan.id);
    return index >= 0 ? index : 0;
  }, [plans, selectedPlan]);
  const baseDailyPrice = useMemo(() => {
    const dayPlans = plans.filter((plan) => plan.period === PlanPeriod.Day);
    const sourcePlans = dayPlans.length ? dayPlans : plans;
    if (!sourcePlans.length) return 0;
    return Math.min(...sourcePlans.map(getDailyPrice));
  }, [plans]);
  const activeFeatures = useMemo(() => {
    const activeA = new Set<number>();
    const activeB = new Set<number>();

    if (selectedPlanIndex === 0) {
      activeA.add(0);
      activeA.add(1);
      activeB.add(0);
      activeB.add(2);
    } else if (selectedPlanIndex === 1) {
      activeA.add(0);
      activeA.add(1);
      activeB.add(0);
      activeB.add(1);
      activeB.add(2);
      activeB.add(3);
    } else if (selectedPlanIndex === 2) {
      activeA.add(0);
      activeA.add(1);
      activeA.add(2);
      activeB.add(0);
      activeB.add(1);
      activeB.add(2);
      activeB.add(3);
      activeB.add(4);
    } else {
      PlanFeaturesA.forEach((_, index) => activeA.add(index));
      PlanFeaturesB.forEach((_, index) => activeB.add(index));
    }

    return { activeA, activeB };
  }, [selectedPlanIndex]);

  const remaining = getRemainingLabel(user?.subscribedUntil);

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
      <Card className={s.statusCard}>
        <div>
          <Typography as="div" variant="body-sm" className={s.statusTitle}>
            Your plan
          </Typography>
          <Typography as="div" variant="heading-sm" className={s.statusValue}>
            {remaining.active ? 'Subscribed' : ''}
          </Typography>
        </div>
        <Typography as="div" variant="body-sm" className={s.statusDate}>
          {remaining.label}
        </Typography>
      </Card>

      {isLoading ? <Loader /> : null}
      {isError ? (
        <Typography variant="body-md">
          {error instanceof Error ? error.message : 'Failed to load plans'}
        </Typography>
      ) : null}

      {!isLoading && !isError ? (
        <>
          <div className={s.plans}>
            {plans.map((plan) => {
              const currentDailyPrice = getDailyPrice(plan);
              const dailyPriceLabel = Math.max(
                1,
                Math.round(currentDailyPrice),
              );
              const savePercent =
                baseDailyPrice > 0
                  ? Math.max(
                      0,
                      Math.round(
                        (1 - currentDailyPrice / baseDailyPrice) * 100,
                      ),
                    )
                  : 0;

              return (
                <Card
                  key={plan.id}
                  className={`${s.planCard} ${plan.id === selectedId ? s.selected : ''}`}
                  variant={plan.isRecommended ? 'accent' : 'neutral'}
                  onClick={() => setSelectedId(plan.id)}
                >
                  <div className={s.planLeft}>
                    <div className={s.selectIndicator}>
                      <span className={s.selectIndicatorDot} />
                    </div>
                    <div className={s.planRows}>
                      <div className={s.planRowTop}>
                        <Typography
                          as="span"
                          variant="body-sm"
                          family="brand"
                          weight={500}
                          className={s.planPeriod}
                        >
                          {formatPeriod(plan)}
                        </Typography>
                        <span className={s.airRow}>
                          <Typography
                            as="span"
                            variant="body-sm"
                            family="system"
                            weight={600}
                            className={s.airText}
                          >
                            +
                          </Typography>
                          <img
                            className={s.airIcon}
                            src={airIcon}
                            alt="air"
                            draggable={false}
                          />
                          <Typography
                            as="span"
                            variant="body-sm"
                            family="system"
                            weight={600}
                            className={s.airText}
                          >
                            {plan.air} AIR
                          </Typography>
                        </span>
                      </div>
                      <div className={s.planRowBottom}>
                        <TgStarWhiteIcon width={16} height={16} />
                        <Typography
                          as="span"
                          variant="caption"
                          family="system"
                          weight={600}
                          className={s.dailyPrice}
                        >
                          {dailyPriceLabel} / day
                        </Typography>
                        {savePercent > 0 ? (
                          <Typography
                            as="span"
                            variant="caption"
                            family="system"
                            weight={600}
                            className={s.save}
                          >
                            SAVE {savePercent}%
                          </Typography>
                        ) : null}
                        {plan.isRecommended ? (
                          <span className={s.recommendedBadge}>
                            <Typography
                              as="span"
                              variant="caption"
                              family="brand"
                              weight={500}
                              className={s.recommendedBadgeText}
                            >
                              most popular
                            </Typography>
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className={s.planRight}>
                    <TgStarIcon width={20} height={20} />
                    <Typography
                      as="span"
                      variant="body-md"
                      family="system"
                      weight={600}
                      className={s.priceAmount}
                    >
                      {plan.price}
                    </Typography>
                  </div>
                </Card>
              );
            })}
          </div>

          {selectedPlan ? (
            <div className={s.featuresGrid}>
              <div className={s.featuresColumnA}>
                {PlanFeaturesA.map((feature, index) => {
                  const isActive = activeFeatures.activeA.has(index);
                  return (
                    <div
                      key={`feature-a-${index}`}
                      className={`${s.featureItem} ${isActive ? s.featureActive : s.featureInactive}`}
                    >
                      {isActive ? (
                        <CheckIcon width={16} height={16} className={s.featureIcon} />
                      ) : (
                        <MinusIcon width={16} height={16} className={s.featureIcon} />
                      )}
                      <Typography
                        as="span"
                        variant="body-md"
                        family="system"
                        weight={600}
                        className={s.featureText}
                      >
                        {feature}
                      </Typography>
                    </div>
                  );
                })}
              </div>
              <div className={s.featuresColumnB}>
                {PlanFeaturesB.map((feature, index) => {
                  const isActive = activeFeatures.activeB.has(index);
                  return (
                    <div
                      key={`feature-b-${index}`}
                      className={`${s.featureItem} ${isActive ? s.featureActive : s.featureInactive}`}
                    >
                      {isActive ? (
                        <CheckIcon width={16} height={16} className={s.featureIcon} />
                      ) : (
                        <MinusIcon width={16} height={16} className={s.featureIcon} />
                      )}
                      <Typography
                        as="span"
                        variant="body-md"
                        family="system"
                        weight={600}
                        className={s.featureText}
                      >
                        {feature}
                      </Typography>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          <button className={s.subscribeButton} onClick={handleSubscribe}>
            <Typography as="span" variant="heading-sm" weight={600}>
              {remaining.active ? 'Extend' : 'Subscribe'}
            </Typography>
          </button>
        </>
      ) : null}
    </div>
  );
}
