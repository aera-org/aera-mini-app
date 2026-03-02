import { useQuery, useQueryClient } from '@tanstack/react-query';
import TelegramWebApp from '@twa-dev/sdk';
import { type CSSProperties, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { createPlanInvoice } from '@/api/payments';
import { getPlans } from '@/api/plans';
import air1 from '@/assets/air/air-1.png';
import air2 from '@/assets/air/air-2.png';
import air3 from '@/assets/air/air-3.png';
import air4 from '@/assets/air/air-4.png';
import air5 from '@/assets/air/air-5.png';
import air6 from '@/assets/air/air-6.png';
import { BoltIcon, TgStarIcon } from '@/assets/icons';
import upgradeImage from '@/assets/mini/upgrade.png';
import { type IPlan, PlanType } from '@/common/types';
import { Card, Loader, Typography } from '@/components';
import { useLaunchParams } from '@/context/LaunchParamsContext';

import s from './StorePage.module.scss';

const airIcons = [air1, air2, air3, air4, air5, air6];
const extraBadgeColors = [
  'rgba(240, 116, 58, 1)',
  'rgba(58, 167, 240, 1)',
  'rgba(97, 58, 240, 1)',
  'rgba(19, 179, 72, 1)',
  'rgba(58, 118, 240, 1)',
];

export function StorePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const launchParams = useLaunchParams();
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
  const basePlan = airPlans[0];

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
            Unlimited Fuel
          </Typography>
          <Typography as="div" variant="body-md" className={s.heroSubtitle}>
            Remove any barriers. Endless conversations and spicy images
          </Typography>
        </div>
        <button
          type="button"
          className={s.heroButton}
          onClick={() => navigate('/bag')}
        >
          <BoltIcon width={20} height={20} />
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

      {isLoading ? <Loader /> : null}
      {isError ? (
        <Typography variant="body-md">
          {error instanceof Error ? error.message : 'Failed to load plans'}
        </Typography>
      ) : null}

      {!isLoading && !isError ? (
        <div className={s.grid}>
          {airPlans.map((plan: IPlan, index) => {
            const canCalcExtra =
              index > 0 &&
              basePlan != null &&
              basePlan.price > 0 &&
              basePlan.air > 0 &&
              plan.price > 0;
            const baselineAirForPrice = canCalcExtra
              ? (plan.price / basePlan.price) * basePlan.air
              : 0;
            const extraPercent =
              canCalcExtra && baselineAirForPrice > 0
                ? Math.max(
                    0,
                    Math.round(
                      ((plan.air - baselineAirForPrice) / baselineAirForPrice) *
                        100,
                    ),
                  )
                : 0;
            const badgeColor =
              extraBadgeColors[index - 1] ?? 'rgba(58, 167, 240, 1)';
            const extraBadgeStyle = {
              '--badge-bg': badgeColor,
            } as CSSProperties;
            const showBadgeGroup = plan.isRecommended || index > 0;

            return (
              <Card className={s.planCard} variant="accent" key={plan.id}>
                <img
                  src={airIcons[index % airIcons.length]}
                  alt="air"
                  className={s.planIcon}
                  draggable={false}
                />
                {showBadgeGroup ? (
                  <div className={s.iconBadges}>
                    {plan.isRecommended ? (
                      <Typography
                        as="span"
                        variant="body-sm"
                        family="brand"
                        weight={500}
                        className={s.topChoiceBadge}
                      >
                        top choice
                      </Typography>
                    ) : null}
                    {index > 0 && extraPercent > 0 ? (
                      <Typography
                        as="span"
                        variant="body-sm"
                        family="brand"
                        weight={500}
                        className={s.extraBadge}
                        style={extraBadgeStyle}
                      >
                        +{extraPercent}% extra
                      </Typography>
                    ) : null}
                  </div>
                ) : null}
                <Typography
                  as="div"
                  variant="body-sm"
                  weight={600}
                  className={s.planAir}
                >
                  {plan.air} AIR
                </Typography>
                <button
                  type="button"
                  className={s.planButton}
                  onClick={() => handleBuy(plan)}
                >
                  <TgStarIcon
                    width={20}
                    height={20}
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
      ) : null}
    </div>
  );
}
