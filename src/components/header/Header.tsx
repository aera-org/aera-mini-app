import { Typography } from '@/components';

import s from './Header.module.scss';

type HeaderProps = {
  fuel: number;
  air: number;
  fuelIcon: string;
  airIcon: string;
  actionIcon: React.ReactNode;
  onActionClick: () => void;
};

export function Header({
  fuel,
  air,
  fuelIcon,
  airIcon,
  actionIcon,
  onActionClick,
}: HeaderProps) {
  const fuelMax = 100;
  const normalizedFuel = Math.max(0, Math.min(fuel, fuelMax));
  const fuelPercent = (normalizedFuel / fuelMax) * 100;

  return (
    <header className={s.header}>
      <div className={s.statsRow}>
        <img className={s.fuelIcon} src={fuelIcon} alt="fuel" />
        <div className={s.fuelBar} aria-label={`Fuel ${fuelPercent}%`}>
          <div className={s.fuelTrack}>
            <div className={s.fuelProgress} style={{ width: `${fuelPercent}%` }} />
          </div>
        </div>
        <img className={s.airIcon} src={airIcon} alt="air" />
        <Typography
          as="span"
          variant="body-md"
          family="system"
          weight={600}
          className={s.airCount}
        >
          {air} AIR
        </Typography>
        <button type="button" className={s.iconButton} onClick={onActionClick}>
          {actionIcon}
        </button>
      </div>
    </header>
  );
}
