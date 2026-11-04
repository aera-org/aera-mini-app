import { useQuery, useQueryClient } from '@tanstack/react-query';
import TelegramWebApp from '@twa-dev/sdk';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { createPlanInvoice } from '@/api/payments';
import { getPlanBundles, isNoBundlesError } from '@/api/plans';
import { PixelHeartIcon, TgStarIcon } from '@/assets/icons';
import airIcon from '@/assets/mini/air.png';
import { type IGift, type IPlan, PlanType } from '@/common/types';
import { cn, comparePlansByPeriod, formatPlanPeriod } from '@/common/utils';
import { Loader, MiniAppShell, Typography } from '@/components';
import { useLaunchParams } from '@/context/useLaunchParams';

import s from './BundlesPage.module.scss';

const bundleDiscounts = [57, 63, 73, 73];

type BundleItem = {
  plan: IPlan;
  discount: number;
  oldPrice: number;
  gifts: IGift[];
};

function getOldPrice(price: number, discount: number) {
  return Math.round(price / (1 - discount / 100));
}

function getRemainingMs(expiresAt: string, now: number) {
  const end = Date.parse(expiresAt);
  if (Number.isNaN(end)) return 0;

  return Math.max(0, end - now);
}

type BundleCountdownProps = {
  expiresAt: string;
  onExpire: () => void;
};

function BundleCountdown({ expiresAt, onExpire }: BundleCountdownProps) {
  const { t } = useTranslation();
  const [now, setNow] = useState(() => Date.now());
  const remainingMs = getRemainingMs(expiresAt, now);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (remainingMs <= 0) onExpire();
  }, [onExpire, remainingMs]);

  const units = [
    { value: Math.floor(remainingMs / 3_600_000), label: t('bundles.hours') },
    {
      value: Math.floor((remainingMs % 3_600_000) / 60_000),
      label: t('bundles.minutes'),
    },
    {
      value: Math.floor((remainingMs % 60_000) / 1000),
      label: t('bundles.seconds'),
    },
  ];

  return (
    <section className={s.timerCard}>
      <span className={s.timerBadge}>
        <Typography
          as="span"
          variant="body-sm"
          family="brand"
          weight={600}
          className={s.timerBadgeText}
        >
          {t('bundles.limitedOffer')}
        </Typography>
      </span>
      <div className={s.timer}>
        {units.map(({ value, label }, index) => (
          <Fragment key={label}>
            {index > 0 ? (
              <span className={s.timerColon} aria-hidden>
                :
              </span>
            ) : null}
            <div className={s.timerUnit}>
              <Typography
                as="span"
                variant="heading-lg"
                family="brand"
                weight={500}
                className={s.timerValue}
              >
                {String(value).padStart(2, '0')}
              </Typography>
              <Typography
                as="span"
                variant="caption"
                family="system"
                weight={500}
                className={s.timerLabel}
              >
                {label}
              </Typography>
            </div>
          </Fragment>
        ))}
      </div>
    </section>
  );
}

export function BundlesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const launchParams = useLaunchParams();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['plans', PlanType.Bundle],
    queryFn: getPlanBundles,
    retry: (failureCount, queryError) =>
      !isNoBundlesError(queryError) && failureCount < 3,
    select: (bundles) => ({
      ...bundles,
      plans: [...bundles.plans].sort(comparePlansByPeriod),
    }),
  });

  const hasNoBundles = isNoBundlesError(error);

  const redirectToSubscription = useCallback(() => {
    navigate('/bag', { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (hasNoBundles) redirectToSubscription();
  }, [hasNoBundles, redirectToSubscription]);

  const items: BundleItem[] = (data?.plans ?? []).map((plan, index) => {
    const discount = bundleDiscounts[index] ?? 0;

    return {
      plan,
      discount,
      oldPrice: getOldPrice(plan.price, discount),
      gifts: (plan.bundle?.gifts ?? []).flatMap((giftId) =>
        (data?.gifts ?? []).filter((gift) => gift.id === giftId),
      ),
    };
  });
  const selectedItem =
    items.find((item) => item.plan.id === selectedId) ??
    items.find((item) => item.plan.isRecommended) ??
    items[0];

  const handleBuy = () => {
    if (!selectedItem) return;
    void (async () => {
      try {
        const invoiceLink = await createPlanInvoice(
          selectedItem.plan.id,
          launchParams,
        );
        TelegramWebApp.openInvoice(invoiceLink, (status) => {
          if (status === 'paid') {
            void queryClient.invalidateQueries({ queryKey: ['me'] });
            void queryClient.invalidateQueries({
              queryKey: ['plans', PlanType.Bundle],
            });
            navigate('/girls', { replace: true });
          }
        });
      } catch (err) {
        console.error(err);
      }
    })();
  };

  const renderItem = ({ plan, discount, oldPrice, gifts }: BundleItem) => {
    const isSelected = plan.id === selectedItem?.plan.id;

    return (
      <button
        type="button"
        key={plan.id}
        className={cn(s.card, [], { [s.cardSelected]: isSelected })}
        aria-pressed={isSelected}
        onClick={() => setSelectedId(plan.id)}
      >
        {isSelected ? (
          <Typography
            as="div"
            variant="body-sm"
            family="brand"
            weight={500}
            className={s.cardBanner}
          >
            {t('bundles.onlyHere')}
          </Typography>
        ) : null}
        <div className={s.cardBody}>
          <div className={s.row}>
            <span className={s.rowIcon}>
              <PixelHeartIcon width={21} height={17} />
            </span>
            <div className={s.rowCopy}>
              <Typography
                as="div"
                variant="body-sm"
                family="brand"
                weight={500}
                className={cn(s.rowTitle, [s.rowTitlePremium])}
              >
                {t('bundles.premium', { period: formatPlanPeriod(plan, t) })}
              </Typography>
              <Typography
                as="div"
                variant="caption"
                family="system"
                className={s.rowDescription}
              >
                {t('bundles.premiumDescription')}
              </Typography>
            </div>
          </div>
          <div className={s.row}>
            <span className={s.rowIcon}>
              <img
                src={airIcon}
                alt=""
                className={s.rowImage}
                draggable={false}
              />
            </span>
            <div className={s.rowCopy}>
              <Typography
                as="div"
                variant="body-sm"
                family="brand"
                weight={500}
                className={s.rowTitle}
              >
                {t('bundles.airsInstantly', { air: plan.air })}
              </Typography>
              <Typography
                as="div"
                variant="caption"
                family="system"
                className={s.rowDescription}
              >
                {t('bundles.airsDescription')}
              </Typography>
            </div>
          </div>
          {gifts.map((gift) => (
            <div className={s.row} key={gift.id}>
              <span className={s.rowIcon}>
                <img
                  src={gift.imgUrl}
                  alt=""
                  className={s.rowImage}
                  draggable={false}
                />
              </span>
              <div className={s.rowCopy}>
                <Typography
                  as="div"
                  variant="body-sm"
                  family="brand"
                  weight={500}
                  className={cn(s.rowTitle, [s.rowTextSingleLine])}
                >
                  {gift.name}
                </Typography>
                <Typography
                  as="div"
                  variant="caption"
                  family="system"
                  className={cn(s.rowDescription, [s.rowTextSingleLine])}
                >
                  {gift.description}
                </Typography>
              </div>
            </div>
          ))}
          <div className={s.cardPrice}>
            <Typography
              as="span"
              variant="caption"
              family="system"
              className={s.oldPrice}
            >
              {oldPrice}
            </Typography>
            <Typography
              as="span"
              variant="heading-sm"
              family="brand"
              weight={500}
              className={s.price}
            >
              {plan.price}
            </Typography>
            <TgStarIcon width={20} height={20} className={s.star} />
          </div>
        </div>
        <span className={s.discount}>-{discount}%</span>
      </button>
    );
  };

  return (
    <MiniAppShell appClassName="Bundles">
      <div className={s.page}>
        {isLoading || hasNoBundles ? (
          <div className={s.state}>
            <Loader />
          </div>
        ) : null}
        {error && !data && !hasNoBundles ? (
          <div className={s.state}>
            <Typography variant="body-md">
              {error instanceof Error ? error.message : t('bundles.errors.load')}
            </Typography>
          </div>
        ) : null}
        {data && selectedItem ? (
          <>
            <div className={s.content}>
              <BundleCountdown
                expiresAt={data.expiresAt}
                onExpire={redirectToSubscription}
              />
              <div className={s.columns}>
                {[0, 1].map((column) => (
                  <div className={s.column} key={column}>
                    {items
                      .filter((_, index) => index % 2 === column)
                      .map(renderItem)}
                  </div>
                ))}
              </div>
            </div>
            <div className={s.footer}>
              <Typography
                as="div"
                variant="heading-sm"
                family="brand"
                weight={500}
                className={s.footerTitle}
              >
                {t('bundles.yourChoice')}
              </Typography>
              <div className={s.footerRow}>
                <div className={s.summary}>
                  <Typography
                    as="span"
                    variant="body-sm"
                    family="system"
                    className={s.summaryText}
                  >
                    {t('bundles.summary', {
                      period: formatPlanPeriod(selectedItem.plan, t),
                      air: selectedItem.plan.air,
                    })}
                    {' · '}
                  </Typography>
                  <span className={s.save}>
                    <Typography
                      as="span"
                      variant="body-sm"
                      family="system"
                      weight={500}
                      className={s.saveText}
                    >
                      {t('bundles.save', {
                        amount: selectedItem.oldPrice - selectedItem.plan.price,
                      })}
                    </Typography>
                    <TgStarIcon width={14} height={14} className={s.star} />
                  </span>
                </div>
                <div className={s.footerPrice}>
                  <Typography
                    as="span"
                    variant="body-sm"
                    family="system"
                    className={s.oldPrice}
                  >
                    {selectedItem.oldPrice}
                  </Typography>
                  <Typography
                    as="span"
                    variant="heading-sm"
                    family="brand"
                    weight={500}
                    className={s.price}
                  >
                    {selectedItem.plan.price}
                  </Typography>
                  <TgStarIcon width={20} height={20} className={s.star} />
                </div>
              </div>
              <button type="button" className={s.buyButton} onClick={handleBuy}>
                <Typography
                  as="span"
                  variant="body-md"
                  family="brand"
                  weight={500}
                  className={s.buyButtonText}
                >
                  {t('bundles.letsGo')}
                </Typography>
              </button>
            </div>
          </>
        ) : null}
      </div>
    </MiniAppShell>
  );
}
