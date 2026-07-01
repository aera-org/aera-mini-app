import { useQuery, useQueryClient } from '@tanstack/react-query';
import TelegramWebApp from '@twa-dev/sdk';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';

import { createPlanInvoice } from '@/api/payments';
import { getPlans } from '@/api/plans';
import {
  CheckIcon,
  MinusIcon,
  TgStarIcon,
  TgStarWhiteIcon,
} from '@/assets/icons';
import airIcon from '@/assets/mini/air.png';
import { PlanFeaturesA, PlanFeaturesB } from '@/common/consts';
import { type IPlan, PlanPeriod, PlanType } from '@/common/types';
import { cn } from '@/common/utils';
import { Card, Loader, Typography } from '@/components';
import { useLaunchParams } from '@/context/useLaunchParams';
import { useUser } from '@/context/UserContext';
import { usePaywallOpenTracking } from '@/hooks/usePaywallOpenTracking';

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

const PLAN_NAME = [
  'Trial',
  'Basic',
  'Premium',
  'Ultimate',
]

function getRemainingLabel(subscribedUntil?: string | null, now = Date.now()) {
  if (!subscribedUntil) return { active: false, label: 'Free' };
  const end = Date.parse(subscribedUntil);
  if (Number.isNaN(end)) return { active: false, label: 'Free' };

  const remainingMs = end - now;
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

function getFirstDayOfferTimer(userCreatedAt?: string, now = Date.now()) {
  if (!userCreatedAt) return null;

  const createdAt = Date.parse(userCreatedAt);
  if (Number.isNaN(createdAt)) return null;

  const remainingMs = createdAt + 24 * 3_600_000 - now;
  if (remainingMs <= 0) return null;

  const hours = Math.floor(remainingMs / 3_600_000);
  const minutes = Math.floor((remainingMs % 3_600_000) / 60_000);
  const seconds = Math.floor((remainingMs % 60_000) / 1000);

  return {
    label: [hours, minutes, seconds]
      .map((part) => String(part).padStart(2, '0'))
      .join(':'),
  };
}

function getStandardAnchorPrice(price: number) {
  return Math.round(price * 1.5);
}

type LayoutOutletContext = {
  setBagUpgradeAction: (action: (() => void) | null) => void;
};

export function BagPage() {
  const { user } = useUser();
  const { setBagUpgradeAction } = useOutletContext<LayoutOutletContext>();
  const launchParams = useLaunchParams();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  usePaywallOpenTracking(PlanType.Subscription);

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

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedId) ?? getDefaultPlan(plans),
    [plans, selectedId],
  );
  const selectedPlanIndex = useMemo(() => {
    if (!selectedPlan) return 0;
    const index = plans.findIndex((plan) => plan.id === selectedPlan.id);
    return index >= 0 ? index : 0;
  }, [plans, selectedPlan]);
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

  const remaining = getRemainingLabel(user?.subscribedUntil, now);
  const firstDayOfferTimer = getFirstDayOfferTimer(user?.createdAt, now);

  const handleSubscribe = useCallback(() => {
    if (!selectedPlan) return;
    void (async () => {
      try {
        const invoiceLink = await createPlanInvoice(selectedPlan.id, launchParams);
        TelegramWebApp.openInvoice(invoiceLink, (status) => {
          if (status === 'paid') {
            queryClient.invalidateQueries({ queryKey: ['me'] });
          }
        });
      } catch (err) {
        console.error(err);
      }
    })();
  }, [launchParams, queryClient, selectedPlan]);

  useEffect(() => {
    setBagUpgradeAction(() => handleSubscribe);
    return () => {
      setBagUpgradeAction(null);
    };
  }, [handleSubscribe, setBagUpgradeAction]);

  return (
    <div className={s.container}>
      {remaining.active && (
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
      )}

      {isLoading ? <Loader /> : null}
      {isError ? (
        <Typography variant="body-md">
          {error instanceof Error ? error.message : 'Failed to load plans'}
        </Typography>
      ) : null}

      {!isLoading && !isError ? (
        <>
          <div className={s.introOffer}>
            <div>
              <Typography
                as="div"
                variant="label"
                weight={700}
                className={s.introEyebrow}
              >
                SALE 50% OFF
              </Typography>
              <Typography
                as="div"
                variant="heading-sm"
                weight={600}
                className={s.introTitle}
              >
                {firstDayOfferTimer ? 'First day offer' : 'Exclusive offer'}
              </Typography>
            </div>
            {firstDayOfferTimer ? (
              <div className={s.introTimer}>
                <Typography
                  as="span"
                  variant="body-md"
                  weight={700}
                  className={s.introTimerValue}
                >
                  {firstDayOfferTimer.label}
                </Typography>
              </div>
            ) : null}
          </div>

          <div className={s.plans}>
            {plans.map((plan, index) => {
              const currentDailyPrice = getDailyPrice(plan);
              const dailyPriceLabel = Math.max(
                1,
                Math.round(currentDailyPrice),
              );
              let savePercent = 0
                if(index === 2) {
                  savePercent = 50
                }

                if(index === 3) {
                  savePercent = 70
                }
              const standardAnchorPrice = getStandardAnchorPrice(plan.price);

              return (
                <Card
                  key={plan.id}
                  className={cn(
                    s.planCard,
                    [plan.isRecommended ? s.recommendedPlan : null],
                    { [s.selected]: plan.id === selectedId },
                  )}
                  variant={plan.isRecommended ? 'accent' : 'neutral'}
                  onClick={() => setSelectedId(plan.id)}
                >
                  <div className={s.planHeader}>
                    <div className={s.planTitle}>
                      <Typography
                        as="span"
                        variant="label"
                        family="system"
                        weight={700}
                        className={s.planEyebrow}
                      >
                        {PLAN_NAME[index]}
                      </Typography>
                      <Typography
                        as="span"
                        variant="body-sm"
                        family="brand"
                        weight={500}
                        className={s.planPeriod}
                      >
                        {formatPeriod(plan)}
                      </Typography>
                    </div>
                    <div className={s.planPrice}>
                      <span className={s.priceTop}>
                        <span className={s.oldPrice}>
                          <TgStarIcon width={14} height={14} />
                          <Typography
                            as="span"
                            variant="caption"
                            family="system"
                            weight={700}
                            className={s.oldPriceAmount}
                          >
                            {standardAnchorPrice}
                          </Typography>
                        </span>
                        <span className={s.currentPrice}>
                          <TgStarIcon width={21} height={21} />
                          <Typography
                            as="span"
                            variant="body-md"
                            family="system"
                            weight={700}
                            className={s.priceAmount}
                          >
                            {plan.price}
                          </Typography>
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className={s.planMeta}>
                    <span className={s.metaPill}>
                    <img
                        className={s.airIcon}
                        src={airIcon}
                        alt="air"
                        draggable={false}
                      />
                      <Typography
                        as="span"
                        variant="caption"
                        family="system"
                        weight={700}
                        className={s.metaText}
                      >
                        +{plan.air} AIR
                      </Typography>
                    </span>
                    {index > 1 ? (
                      <span className={s.savePill}>
                        <Typography
                          as="span"
                          variant="caption"
                          family="system"
                          weight={700}
                          className={s.save}
                        >
                          SAVE {savePercent}%
                        </Typography>
                      </span>
                    ) : null}
                    <span className={`${s.metaPill} ${s.dailyPricePill}`}>
                      <TgStarWhiteIcon width={15} height={15} />
                      <Typography
                        as="span"
                        variant="caption"
                        family="system"
                        weight={700}
                        className={s.metaText}
                      >
                        {dailyPriceLabel} / day
                      </Typography>
                    </span>
                  </div>
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
                        <CheckIcon
                          width={16}
                          height={16}
                          className={s.featureIcon}
                        />
                      ) : (
                        <MinusIcon
                          width={16}
                          height={16}
                          className={s.featureIcon}
                        />
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
                        <CheckIcon
                          width={16}
                          height={16}
                          className={s.featureIcon}
                        />
                      ) : (
                        <MinusIcon
                          width={16}
                          height={16}
                          className={s.featureIcon}
                        />
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

        </>
      ) : null}
    </div>
  );
}
