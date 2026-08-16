import { useTranslation } from 'react-i18next';

import { ArrowLeftIcon } from '@/assets/icons';
import { Typography } from '@/components/text';

import s from './Navigation.module.scss';

type BackNavigationProps = {
  onBack: () => void;
};

export function BackNavigation({ onBack }: BackNavigationProps) {
  const { t } = useTranslation();

  return (
    <nav className={`${s.nav} ${s.backNav}`}>
      <button type="button" className={s.backButton} onClick={onBack}>
        <ArrowLeftIcon width={20} height={20} />
        <Typography
          as="span"
          variant="body-md"
          family="system"
          weight={500}
          className={s.backLabel}
        >
          {t('common.back')}
        </Typography>
      </button>
    </nav>
  );
}
