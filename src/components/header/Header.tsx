import { Typography } from '@/components';

import s from './Header.module.scss';

type HeaderProps = {
  pageName: string;
  fuel: number;
  air: number;
  fuelIcon: string;
  airIcon: string;
  actionIcon: React.ReactNode;
  onActionClick: () => void;
};

export function Header({
  pageName,
  fuel,
  air,
  fuelIcon,
  airIcon,
  actionIcon,
  onActionClick,
}: HeaderProps) {
  return (
    <header className={s.header}>
      <Typography variant="heading-lg" className={s.title}>
        {pageName}
      </Typography>
      <div className={s.statsCard}>
        <div className={s.stat}>
          <img className={s.icon} src={fuelIcon} alt="fuel" />
          <Typography as="span" variant="body-sm" weight={600} className={s.count}>
            {fuel}
          </Typography>
        </div>
        <div className={s.stat}>
          <img className={s.icon} src={airIcon} alt="air" />
          <Typography as="span" variant="body-sm" weight={600} className={s.count}>
            {air}
          </Typography>
        </div>
        <button className={s.iconButton} onClick={onActionClick}>
          {actionIcon}
        </button>
      </div>
    </header>
  );
}
