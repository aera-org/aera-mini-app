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
import { cn } from '@/common/utils';
import { Loader, Text } from '@/components';
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
      <div className={s.heroCard}>
        <div className={s.heroIconWrap}>
          <img src={fuelIcon} alt="fuel" className={s.heroIcon} />
        </div>
        <div className={s.heroContent}>
          <div className={s.heroTitle}>Unlimited Fuel</div>
          <div className={s.heroSubtitle}>
            Remove the barriers. Gain endless fuel!
          </div>
          <button
            type="button"
            className={s.heroButton}
            onClick={() => navigate('/bag')}
          >
            🚀 Let&apos;s go
          </button>
        </div>
      </div>

      {isLoading ? <Loader /> : null}
      {isError ? (
        <Text variant="span">
          {error instanceof Error ? error.message : 'Failed to load plans'}
        </Text>
      ) : null}

      {!isLoading && !isError ? (
        <div className={s.grid}>
          {airPlans.map((plan: IPlan, index) => (
            <div className={cn(s.planCard)} key={plan.id}>
              {plan.isRecommended ? (
                <span className={s.recommendedBadge}>Best Offer</span>
              ) : null}
              <img
                src={airIcons[index % airIcons.length]}
                alt="air"
                className={s.planIcon}
                draggable={false}
              />
              <div className={s.planAir}>{plan.air} air</div>
              <button
                type="button"
                className={s.planButton}
                onClick={() => handleBuy(plan)}
              >
                <span className={s.planPrice}>{plan.price}</span>
                <span className={s.planStar}>⭐️</span>
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
