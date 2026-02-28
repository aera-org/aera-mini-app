import { ArrowLeftIcon, BoltIcon } from '@/assets/icons';
import { Typography } from '@/components/text';

import s from './Navigation.module.scss';

type BagNavigationProps = {
  onBack: () => void;
  onUpgrade: () => void;
};

export function BagNavigation({ onBack, onUpgrade }: BagNavigationProps) {
  return (
    <nav className={s.bagNav}>
      <button
        type="button"
        className={s.bagBackButton}
        aria-label="Back"
        onClick={onBack}
      >
        <ArrowLeftIcon width={20} height={20} />
      </button>
      <button type="button" className={s.bagUpgradeButton} onClick={onUpgrade}>
        <BoltIcon width={20} height={20} />
        <Typography
          as="span"
          variant="body-md"
          family="system"
          weight={500}
          className={s.bagUpgradeText}
        >
          Upgrade
        </Typography>
      </button>
    </nav>
  );
}
