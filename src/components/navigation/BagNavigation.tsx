import { useTranslation } from 'react-i18next';

import { ArrowLeftIcon, SparklesIcon } from '@/assets/icons';
import { Typography } from '@/components/text';

import s from './Navigation.module.scss';

type BagNavigationProps = {
  onBack: () => void;
  onUpgrade: () => void;
};

export function BagNavigation({ onBack, onUpgrade }: BagNavigationProps) {
  const { t } = useTranslation();

  return (
    <nav className={s.bagNav}>
      <button
        type="button"
        className={s.bagBackButton}
        aria-label={t('common.back')}
        onClick={onBack}
      >
        <ArrowLeftIcon width={20} height={20} />
      </button>
      <button type="button" className={s.bagUpgradeButton} onClick={onUpgrade}>
        <SparklesIcon width={22} height={22} />
        <Typography
          as="span"
          variant="body-md"
          family="system"
          weight={500}
          className={s.bagUpgradeText}
        >
          {t('bag.upgrade')}
        </Typography>
      </button>
    </nav>
  );
}
