import { useQuery, useQueryClient } from '@tanstack/react-query';
import TelegramWebApp from '@twa-dev/sdk';
import { type KeyboardEvent, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { createPlanInvoice } from '@/api/payments';
import { getPlans } from '@/api/plans';
import air1 from '@/assets/air/air-2.png';
import air2 from '@/assets/air/air-3.png';
import air3 from '@/assets/air/air-4.png';
import air4 from '@/assets/air/air-5.png';
import air5 from '@/assets/air/air-6.png';
import { GiftIcon, TgStarIcon, ZapIcon } from '@/assets/icons';
import fuelIcon from '@/assets/mini/fuel.png';
import {
  type CustomCharacterCreateRouteState,
  type IPlan,
  PlanType,
} from '@/common/types';
import { cn } from '@/common/utils';
import { Card, Loader, Typography } from '@/components';
import { useLaunchParams } from '@/context/useLaunchParams';
import { usePaywallOpenTracking } from '@/hooks/usePaywallOpenTracking';

import s from './StorePage.module.scss';

// TODO: separate icon for the 6th pack
const airIcons = [air1, air2, air3, air4, air5, air5];
const extraPercent = [0, 40, 60, 85, 100, 125];
const DEFAULT_HIGHLIGHTED_INDEX = 1;

export function StorePage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const launchParams = useLaunchParams();
  const customCharacterRouteState = getCustomCharacterRouteState(location.state);
  usePaywallOpenTracking(PlanType.Air);
  const {
    data: plans = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['plans', PlanType.Air],
    queryFn: () => getPlans(PlanType.Air),
  });

  const airPlanItems = useMemo(
    () =>
      plans.slice(0, airIcons.length).map((plan, index) => ({
        plan,
        index,
        icon: airIcons[index],
        extra: extraPercent[index] ?? 0,
      })),
    [plans],
  );
  const highlightedPlanId = useMemo(() => {
    const recommendedPlan = airPlanItems.find((item) => item.plan.isRecommended);

    return (recommendedPlan ?? airPlanItems[DEFAULT_HIGHLIGHTED_INDEX])?.plan.id;
  }, [airPlanItems]);
  const planLabels = t('store.planLabels', {
    returnObjects: true,
  }) as string[];

  useEffect(() => {
    const handler = () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    };
    TelegramWebApp.onEvent('invoiceClosed', handler);
    return () => {
      TelegramWebApp.offEvent('invoiceClosed', handler);
    };
  }, [queryClient]);

  const handleBuy = (plan: IPlan) => {
    void (async () => {
      try {
        const invoiceLink = await createPlanInvoice(plan.id, launchParams);
        TelegramWebApp.openInvoice(invoiceLink, (status) => {
          if (status === 'paid') {
            void queryClient.invalidateQueries({ queryKey: ['me'] }).finally(() => {
              if (!customCharacterRouteState) return;

              navigate('/my-girls/create', {
                replace: true,
                state: {
                  ...customCharacterRouteState,
                  purchaseCompleted: true,
                } satisfies CustomCharacterCreateRouteState,
              });
            });
          }
        });
      } catch (err) {
        console.error(err);
      }
    })();
  };

  const handlePlanCardKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    plan: IPlan,
  ) => {
    if (event.target !== event.currentTarget) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;

    event.preventDefault();
    handleBuy(plan);
  };

  return (
    <div className={s.container}>
      {isLoading ? <Loader /> : null}
      {isError ? (
        <Typography variant="body-md">
          {error instanceof Error ? error.message : t('store.errors.plans')}
        </Typography>
      ) : null}

      {!isLoading && !isError ? (
        <>
          <Card className={s.fuelBanner} variant="neutral">
            <img
              src={fuelIcon}
              alt=""
              className={s.fuelIcon}
              aria-hidden
              draggable={false}
            />
            <div className={s.fuelCopy}>
              <Typography as="div" variant="body-md" weight={600} className={s.fuelTitle}>
                {t('store.unlimitedFuel.title')}
              </Typography>
              <Typography as="div" variant="caption" className={s.fuelSubtitle}>
                {t('store.unlimitedFuel.subtitle')}
              </Typography>
            </div>
            <button
              type="button"
              className={s.upgradeButton}
              onClick={() => navigate('/bag')}
            >
              <ZapIcon width={16} height={16} />
              <Typography
                as="span"
                variant="body-sm"
                weight={600}
                className={s.upgradeButtonText}
              >
                {t('store.upgrade')}
              </Typography>
            </button>
          </Card>

          <div className={s.grid}>
            {airPlanItems.map(({ plan, icon, extra, index }) => {
              const isHighlighted = plan.id === highlightedPlanId;

              return (
                <Card
                  className={cn(s.planCard, [
                    index === 0 ? s.budgetPlan : s.wildPlan,
                    isHighlighted ? s.highlightedPlan : null,
                  ])}
                  variant="accent"
                  key={plan.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleBuy(plan)}
                  onKeyDown={(event) => handlePlanCardKeyDown(event, plan)}
                >
                  {isHighlighted ? (
                    <Typography
                      as="span"
                      variant="label"
                      weight={700}
                      className={s.bestValueBadge}
                    >
                      {t('store.bestValue')}
                    </Typography>
                  ) : null}
                  {extra > 0 ? (
                    <Typography
                      as="span"
                      variant="caption"
                      weight={700}
                      className={s.extraBadge}
                    >
                      +{extra}%
                    </Typography>
                  ) : null}
                  <img
                    src={icon}
                    alt=""
                    className={s.planIcon}
                    aria-hidden
                    draggable={false}
                  />
                  <Typography
                    as="div"
                    variant="body-sm"
                    weight={700}
                    className={s.planAir}
                  >
                    {plan.air.toLocaleString('en-US')} AIR
                  </Typography>
                  <Typography
                    as="div"
                    variant="caption"
                    weight={700}
                    className={s.extraText}
                  >
                    {planLabels[index] ?? ''}
                  </Typography>
                  <button
                    type="button"
                    className={s.planButton}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleBuy(plan);
                    }}
                  >
                    <TgStarIcon
                      width={16}
                      height={16}
                      className={s.planStarIcon}
                    />
                    <Typography
                      as="span"
                      variant="body-sm"
                      family="brand"
                      weight={500}
                      className={s.planPrice}
                    >
                      {plan.price.toLocaleString('en-US')}
                    </Typography>
                  </button>
                </Card>
              );
            })}
          </div>

          <Card className={s.infoCard} variant="neutral">
            <span className={s.infoIcon} aria-hidden>
              <GiftIcon width={26} height={26} />
            </span>
            <div className={s.infoCopy}>
              <Typography as="div" variant="body-md" weight={600} className={s.infoTitle}>
                <span aria-hidden>☆</span> {t('store.biggerPacks.title')}
              </Typography>
              <Typography as="div" variant="caption" className={s.infoSubtitle}>
                {t('store.biggerPacks.subtitle')}
              </Typography>
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}

function getCustomCharacterRouteState(
  value: unknown,
): CustomCharacterCreateRouteState | null {
  if (!value || typeof value !== 'object') return null;

  const state = value as Partial<CustomCharacterCreateRouteState>;
  if (state.source !== 'custom-character-create') return null;
  if (state.returnStep !== 'review') return null;
  if (typeof state.autoCreateAfterPurchase !== 'boolean') return null;
  if (!state.draft || typeof state.draft !== 'object') return null;
  if (typeof state.draft.name !== 'string') return null;
  if (!Array.isArray(state.draft.personality)) return null;

  return state as CustomCharacterCreateRouteState;
}
