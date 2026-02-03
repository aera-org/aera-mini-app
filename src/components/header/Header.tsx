import { Text } from '@/components';

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
      <Text variant="h2" className={s.title}>
        {pageName}
      </Text>
      <div className={s.statsCard}>
        <div className={s.stat}>
          <img className={s.icon} src={fuelIcon} alt="fuel" />
          <span className={s.count}>{fuel}</span>
        </div>
        <div className={s.stat}>
          <img className={s.icon} src={airIcon} alt="air" />
          <span className={s.count}>{air}</span>
        </div>
        <button className={s.iconButton} onClick={onActionClick}>
          {actionIcon}
        </button>
      </div>
    </header>
  );
}
