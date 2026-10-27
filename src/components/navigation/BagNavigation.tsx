import { useTranslation } from 'react-i18next';

import { ArrowLeftIcon, TgStarIcon, ZapIcon } from '@/assets/icons';
import { Typography } from '@/components/text';

import s from './Navigation.module.scss';

export type BagSummary = {
  label: string;
  price: number;
};

type BagNavigationProps = {
  summary?: BagSummary | null;
  onBack: () => void;
  onUpgrade: () => void;
};

export function BagNavigation({ summary, onBack, onUpgrade }: BagNavigationProps) {
  const { t } = useTranslation();

  return (
    <nav className={s.bagNav}>
      {summary ? (
        <div className={s.bagSummary}>
          <span className={s.bagSummaryDot} aria-hidden />
          <Typography
            as="span"
            variant="body-sm"
            family="system"
            weight={500}
            className={s.bagSummaryLabel}
          >
            {summary.label}
          </Typography>
          <span className={s.bagSummaryPrice}>
            <TgStarIcon width={16} height={16} />
            <Typography
              as="span"
              variant="body-md"
              family="system"
              weight={700}
              className={s.bagSummaryPriceText}
            >
              {summary.price}
            </Typography>
          </span>
        </div>
      ) : null}
      <div className={s.bagActions}>
        <button
          type="button"
          className={s.bagBackButton}
          aria-label={t('common.back')}
          onClick={onBack}
        >
          <ArrowLeftIcon width={20} height={20} />
        </button>
        <button type="button" className={s.bagUpgradeButton} onClick={onUpgrade}>
          <ZapIcon width={22} height={22} />
          <Typography
            as="span"
            variant="body-md"
            family="system"
            weight={600}
            className={s.bagUpgradeText}
          >
            {t('bag.upgrade')}
          </Typography>
        </button>
      </div>
    </nav>
  );
}
