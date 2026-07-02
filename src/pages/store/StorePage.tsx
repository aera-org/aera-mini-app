import { useQuery, useQueryClient } from '@tanstack/react-query';
import TelegramWebApp from '@twa-dev/sdk';
import { type KeyboardEvent, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { createPlanInvoice } from '@/api/payments';
import { getPlans } from '@/api/plans';
import air1 from '@/assets/air/air-2.png';
import air2 from '@/assets/air/air-4.png';
import air3 from '@/assets/air/air-5.png';
import air4 from '@/assets/air/air-6.png';
// import air5 from '@/assets/air/air-5.png';
// import air6 from '@/assets/air/air-6.png';
import { SparklesIcon, TgStarIcon } from '@/assets/icons';
import upgradeImage from '@/assets/mini/upgrade.png';
import {
  type CustomCharacterCreateRouteState,
  type IPlan,
  PlanType,
} from '@/common/types';
import { Card, Loader, Typography } from '@/components';
import { useLaunchParams } from '@/context/useLaunchParams';
import { usePaywallOpenTracking } from '@/hooks/usePaywallOpenTracking';

import s from './StorePage.module.scss';

const airIcons = [air1, air2, air3, air4];
const extraPercent = [
  0, 25, 40, 60
]
const secondaryPlanLabels = ['one night', 'satisfaction', 'crazy & horny'];

export function StorePage() {
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

  const airPlans = useMemo(() => plans.slice(0, airIcons.length), [plans]);
  const airPlanItems = useMemo(
    () =>
      airPlans.map((plan, index) => ({
        plan,
        index,
        icon: airIcons[index % airIcons.length],
        extra: extraPercent[index] ?? 0,
      })),
    [airPlans],
  );
  const featuredPlan = useMemo(() => {
    if (airPlanItems.length === 0) return null;
    const recommendedPlan = airPlanItems.find((item) => item.plan.isRecommended);
    if (recommendedPlan) return recommendedPlan;

    return airPlanItems.reduce((best, item) =>
      item.extra > best.extra ? item : best,
    );
  }, [airPlanItems]);
  const secondaryPlans = useMemo(
    () =>
      featuredPlan
        ? airPlanItems.filter((item) => item.plan.id !== featuredPlan.plan.id)
        : airPlanItems,
    [airPlanItems, featuredPlan],
  );

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
          {error instanceof Error ? error.message : 'Failed to load plans'}
        </Typography>
      ) : null}

      {!isLoading && !isError ? (
        <>
          <div className={s.offerHeader}>
            <Typography
              as="div"
              variant="label"
              weight={700}
              className={s.offerEyebrow}
            >
              AIR SALE
            </Typography>
            <Typography
              as="div"
              variant="heading-lg"
              weight={600}
              className={s.offerTitle}
            >
              Fulfill your wildest fantasies and hidden desires
            </Typography>
            <Typography
              as="div"
              variant="body-sm"
              weight={500}
              className={s.offerSubtitle}
            >
              Use AIR for personal photos, explicit videos, gifts, or create your Dream Girlfriend.
            </Typography>
          </div>

          {featuredPlan ? (
            <Card
              className={s.featuredPlanCard}
              variant="accent"
              role="button"
              tabIndex={0}
              onClick={() => handleBuy(featuredPlan.plan)}
              onKeyDown={(event) =>
                handlePlanCardKeyDown(event, featuredPlan.plan)
              }
            >
              <div className={s.featuredCopy}>
                <Typography
                  as="span"
                  variant="label"
                  weight={700}
                  className={s.featuredBadge}
                >
                  best value
                </Typography>
                <Typography
                  as="div"
                  variant="heading-lg"
                  weight={700}
                  className={s.featuredAir}
                >
                  {featuredPlan.plan.air} AIR
                </Typography>
                <Typography
                  as="div"
                  variant="body-sm"
                  weight={600}
                  className={s.featuredBonus}
                >
                  +{featuredPlan.extra}% bonus included
                </Typography>
                <button
                  type="button"
                  className={s.featuredButton}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleBuy(featuredPlan.plan);
                  }}
                >
                  <TgStarIcon
                    width={20}
                    height={20}
                    className={s.planStarIcon}
                  />
                  <span>{featuredPlan.plan.price}</span>
                </button>
              </div>
              <img
                src={featuredPlan.icon}
                alt=""
                className={s.featuredIcon}
                aria-hidden
                draggable={false}
              />
            </Card>
          ) : null}

          <div className={s.grid}>
            {secondaryPlans.map(({ plan, icon, extra }, secondaryIndex) => {
              const planLabel =
                secondaryPlanLabels[secondaryIndex] ?? secondaryPlanLabels[0];
              const toneClassName =
                [s.budgetPlan, s.middlePlan, s.wildPlan][secondaryIndex] ??
                s.budgetPlan;

              return (
                <Card
                  className={`${s.planCard} ${toneClassName}`}
                  variant="accent"
                  key={plan.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleBuy(plan)}
                  onKeyDown={(event) => handlePlanCardKeyDown(event, plan)}
                >
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
                  <div className={s.planTop}>
                    <img
                      src={icon}
                      alt=""
                      className={s.planIcon}
                      aria-hidden
                      draggable={false}
                    />
                    {plan.isRecommended ? (
                      <Typography
                        as="span"
                        variant="caption"
                        weight={700}
                        className={s.topChoiceBadge}
                      >
                        popular
                      </Typography>
                    ) : null}
                  </div>
                  <Typography
                    as="div"
                    variant="body-sm"
                    weight={700}
                    className={s.planAir}
                  >
                    {plan.air} AIR
                  </Typography>
                  <Typography
                    as="div"
                    variant="caption"
                    weight={700}
                    className={s.extraText}
                  >
                    {planLabel}
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
                      width={18}
                      height={18}
                      className={s.planStarIcon}
                    />
                    <Typography
                      as="span"
                      variant="body-sm"
                      family="brand"
                      weight={500}
                      className={s.planPrice}
                    >
                      {plan.price}
                    </Typography>
                  </button>
                </Card>
              );
            })}
          </div>

          <Card className={s.heroCard} variant="neutral">
            <img
              src={upgradeImage}
              alt=""
              className={s.heroDecor}
              aria-hidden
              draggable={false}
            />
            <div className={s.heroLeft}>
              <Typography as="div" variant="heading-lg" className={s.heroTitle}>
                Want unlimited?
              </Typography>
              <Typography as="div" variant="body-md" className={s.heroSubtitle}>
                Endless chats and explicit photos.
              </Typography>
            </div>
            <button
              type="button"
              className={s.heroButton}
              onClick={() => navigate('/bag')}
            >
              <SparklesIcon width={18} height={18} />
              <Typography
                as="span"
                variant="body-sm"
                weight={500}
                className={s.heroButtonText}
              >
                Upgrade
              </Typography>
            </button>
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
