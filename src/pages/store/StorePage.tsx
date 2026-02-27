import { useQuery, useQueryClient } from '@tanstack/react-query';
import TelegramWebApp from '@twa-dev/sdk';
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { createPlanInvoice } from '@/api/payments';
import { getPlans } from '@/api/plans';
import air1 from '@/assets/air/air-1.png';
import air2 from '@/assets/air/air-2.png';
import air3 from '@/assets/air/air-3.png';
import air4 from '@/assets/air/air-4.png';
import air5 from '@/assets/air/air-5.png';
import air6 from '@/assets/air/air-6.png';
import fuelIcon from '@/assets/mini/fuel.png';
import { type IPlan, PlanType } from '@/common/types';
import { Card, Loader, Typography } from '@/components';
import { useLaunchParams } from '@/context/LaunchParamsContext';

import s from './StorePage.module.scss';

const airIcons = [air1, air2, air3, air4, air5, air6];

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
      <Card className={s.heroCard} variant="accent">
        <div className={s.heroIconWrap}>
          <img src={fuelIcon} alt="fuel" className={s.heroIcon} />
        </div>
        <div className={s.heroContent}>
          <Typography as="div" variant="heading-md" className={s.heroTitle}>
            Unlimited Fuel
          </Typography>
          <Typography as="div" variant="body-sm" className={s.heroSubtitle}>
            Remove the barriers. Gain endless fuel!
          </Typography>
          <button
            type="button"
            className={s.heroButton}
            onClick={() => navigate('/bag')}
          >
            <Typography as="span" variant="body-md" weight={600}>
              🚀 Let&apos;s go
            </Typography>
          </button>
        </div>
      </Card>

      {isLoading ? <Loader /> : null}
      {isError ? (
        <Typography variant="body-md">
          {error instanceof Error ? error.message : 'Failed to load plans'}
        </Typography>
      ) : null}

      {!isLoading && !isError ? (
        <div className={s.grid}>
          {airPlans.map((plan: IPlan, index) => (
            <Card className={s.planCard} variant="accent" key={plan.id}>
              {plan.isRecommended ? (
                <Typography
                  as="span"
                  variant="label"
                  weight={600}
                  className={s.recommendedBadge}
                >
                  Best Offer
                </Typography>
              ) : null}
              <img
                src={airIcons[index % airIcons.length]}
                alt="air"
                className={s.planIcon}
                draggable={false}
              />
              <Typography as="div" variant="body-sm" weight={600} className={s.planAir}>
                {plan.air} air
              </Typography>
              <button
                type="button"
                className={s.planButton}
                onClick={() => handleBuy(plan)}
              >
                <Typography as="span" variant="body-sm" weight={600} className={s.planPrice}>
                  {plan.price}
                </Typography>
                <Typography as="span" variant="body-sm" className={s.planStar}>
                  ⭐️
                </Typography>
              </button>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
