import { useQuery, useQueryClient } from '@tanstack/react-query';
import TelegramWebApp from '@twa-dev/sdk';
import type { TFunction } from 'i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';

import { createPlanInvoice } from '@/api/payments';
import { getPlans } from '@/api/plans';
import {
  CheckIcon,
  ClapperboardIcon,
  EyeOffIcon,
  GiftYIcon,
  ImageYIcon,
  LayersYIcon,
  MessageYIcon,
  SparklesYIcon,
  TgStarIcon,
  TgStarWhiteIcon,
  ZapIcon,
} from '@/assets/icons';
import airIcon from '@/assets/mini/air.png';
import { type IPlan, PlanPeriod, PlanType } from '@/common/types';
import { getSubscriptionRemaining } from '@/common/utils';
import { cn } from '@/common/utils';
import { Card, Loader, Typography } from '@/components';
import type { BagSummary } from '@/components/navigation/BagNavigation';
import { useLaunchParams } from '@/context/useLaunchParams';
import { useUser } from '@/context/user-context';
import { usePaywallOpenTracking } from '@/hooks/usePaywallOpenTracking';

import s from './BagPage.module.scss';

const periodOrder: Record<PlanPeriod, number> = {
  [PlanPeriod.Day]: 0,
  [PlanPeriod.Month]: 1,
  [PlanPeriod.Year]: 2,
};

const savePercents = [0, 82, 88, 90];

// Longer plans unlock extra features on top of the shorter ones
const planFeatures = [
  { key: 'fuel', Icon: ZapIcon, minPlanIndex: 0 },
  { key: 'voice', Icon: MessageYIcon, minPlanIndex: 0 },
  { key: 'photos', Icon: ImageYIcon, minPlanIndex: 0 },
  { key: 'animations', Icon: ClapperboardIcon, minPlanIndex: 0 },
  { key: 'gifts', Icon: GiftYIcon, minPlanIndex: 0 },
  { key: 'customCharacter', Icon: GiftYIcon, minPlanIndex: 0 },
  { key: 'roleplay', Icon: SparklesYIcon, minPlanIndex: 1 },
  { key: 'hiddenScenarios', Icon: EyeOffIcon, minPlanIndex: 2 },
  { key: 'deepImmersion', Icon: LayersYIcon, minPlanIndex: 3 },
];

function formatPeriod(plan: IPlan, t: TFunction) {
  if (!plan.period) return '';
  return t(`bag.periods.${plan.period}`, { count: plan.periodCount ?? 1 });
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

type LayoutOutletContext = {
  setBagUpgradeAction: (action: (() => void) | null) => void;
  setBagSummary: (summary: BagSummary | null) => void;
};

export function BagPage() {
  const { t } = useTranslation();
  const { user } = useUser();
  const { setBagUpgradeAction, setBagSummary } =
    useOutletContext<LayoutOutletContext>();
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
  const visibleFeatures = planFeatures.filter(
    (feature) => feature.minPlanIndex <= selectedPlanIndex,
  );

  const remaining = getSubscriptionRemaining(user?.subscribedUntil, now);

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

  useEffect(() => {
    if (!selectedPlan) {
      setBagSummary(null);
      return;
    }
    setBagSummary({
      label: t('bag.summary', {
        period: formatPeriod(selectedPlan, t),
        air: selectedPlan.air,
      }),
      price: selectedPlan.price,
    });
    return () => {
      setBagSummary(null);
    };
  }, [selectedPlan, setBagSummary, t]);

  return (
    <div className={s.container}>
      {remaining.active && (
        <Card className={s.statusCard}>
          <div>
            <Typography as="div" variant="body-sm" className={s.statusTitle}>
              {t('bag.statusTitle')}
            </Typography>
            <Typography as="div" variant="heading-sm" className={s.statusValue}>
              {t('bag.subscribed')}
            </Typography>
          </div>
          <Typography as="div" variant="body-sm" className={s.statusDate}>
            {t(remaining.key, { count: remaining.count })}
          </Typography>
        </Card>
      )}

      {isLoading ? <Loader /> : null}
      {isError ? (
        <Typography variant="body-md">
          {error instanceof Error ? error.message : t('bag.errors.plans')}
        </Typography>
      ) : null}

      {!isLoading && !isError ? (
        <>
          <div className={s.plans}>
            {plans.map((plan, index) => {
              const isSelected = plan.id === selectedPlan?.id;
              const dailyPriceLabel = Math.max(
                1,
                Math.round(getDailyPrice(plan)),
              );
              const savePercent = savePercents[index] ?? 0;
              const StarIcon = isSelected ? TgStarIcon : TgStarWhiteIcon;

              return (
                <Card
                  key={plan.id}
                  className={cn(s.planCard, [], { [s.selected]: isSelected })}
                  onClick={() => setSelectedId(plan.id)}
                >
                  {plan.isRecommended ? (
                    <span className={s.recommendedBadge}>
                      <Typography
                        as="span"
                        variant="caption"
                        family="system"
                        weight={700}
                        className={s.recommendedBadgeText}
                      >
                        {t('bag.mostPopular')}
                      </Typography>
                    </span>
                  ) : null}
                  <span className={s.radio} aria-hidden />
                  <Typography
                    as="span"
                    variant="body-sm"
                    family="brand"
                    weight={500}
                    className={s.planPeriod}
                  >
                    {formatPeriod(plan, t)}
                  </Typography>
                  <span className={s.planAir}>
                    <img
                      className={s.airIcon}
                      src={airIcon}
                      alt=""
                      draggable={false}
                    />
                    <Typography
                      as="span"
                      variant="caption"
                      family="system"
                      weight={600}
                      className={s.planAirText}
                    >
                      {plan.air} AIRS
                    </Typography>
                  </span>
                  <Typography
                    as="span"
                    variant="caption"
                    family="system"
                    weight={500}
                    className={s.dailyPrice}
                  >
                    {t('bag.dailyPrice', { price: dailyPriceLabel })}
                  </Typography>
                  {savePercent > 0 ? (
                    <Typography
                      as="span"
                      variant="caption"
                      family="system"
                      weight={700}
                      className={s.save}
                    >
                      {t('bag.savePercent', { percent: savePercent })}
                    </Typography>
                  ) : null}
                  <span className={s.planPrice}>
                    <StarIcon width={15} height={15} />
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
                </Card>
              );
            })}
          </div>

          {selectedPlan ? (
            <>
              <Typography
                as="div"
                variant="caption"
                family="system"
                weight={500}
                className={s.featuresTitle}
              >
                {t('bag.includedIn', {
                  period: formatPeriod(selectedPlan, t),
                })}
              </Typography>
              <div className={s.features}>
                {visibleFeatures.map(({ key, Icon }) => (
                  <div key={key} className={s.featureItem}>
                    <span className={s.featureIconWrap}>
                      <Icon width={20} height={20} />
                    </span>
                    <div className={s.featureCopy}>
                      <Typography
                        as="div"
                        variant="body-md"
                        family="system"
                        weight={500}
                        className={s.featureTitle}
                      >
                        {t(`bag.features.${key}.title`)}
                      </Typography>
                      <Typography
                        as="div"
                        variant="body-sm"
                        family="system"
                        className={s.featureDescription}
                      >
                        {t(`bag.features.${key}.description`)}
                      </Typography>
                    </div>
                    <CheckIcon
                      width={18}
                      height={18}
                      className={s.featureCheck}
                    />
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
