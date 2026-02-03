import { useState } from 'react';
import classNames from 'classnames';

import { Button } from '../button';

import s from './index.module.css';

export default function Filter({
  className,
  onClick,
  items,
  activeIndex,
  setActiveIndex,
}: {
  onClick?: (index: number | null) => void;
  setActiveIndex?: (index: number | null) => void;
  activeIndex?: number | null;
  className?: string;
  items?: string[];
}) {
  const [active, setActive] = useState<number | null>(activeIndex ?? null);

  const filterItems = items || ['Backgrounds', 'Accessory'];

  const filter = filterItems.map((label, index) => {
    const isActive = index === (activeIndex ?? active);

    return (
      <Button
        key={label}
        label={label}
        primary
        size="small"
        onClick={() => {
          if (active === index) {
            if (setActiveIndex) {
              setActiveIndex(null);
            }
            if (onClick) {
              onClick(null);
            }
            setActive(null);
            return;
          }
          if (onClick) {
            onClick(index);
          }
          if (setActiveIndex) {
            setActiveIndex(index);
          }
          setActive(index);
        }}
        className={classNames(s.filterBtn, { [s.isActive || '']: isActive })}
      />
    );
  });

  return (
    <div className={classNames(s.filterContainer, [className])}>{filter}</div>
  );
}
