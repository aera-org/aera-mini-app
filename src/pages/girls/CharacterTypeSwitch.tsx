import type { CSSProperties } from 'react';

import { CharacterType } from '@/common/types';
import { cn } from '@/common/utils';

import s from './CharacterTypeSwitch.module.scss';

type CharacterTypeSwitchProps = {
  value: CharacterType;
  onChange: (value: CharacterType) => void;
  disabled?: boolean;
};

const OPTIONS = [
  {
    label: 'Anime',
    value: CharacterType.Anime,
  },
  {
    label: 'Realistic',
    value: CharacterType.Realistic,
  },
] as const;

export function CharacterTypeSwitch({
  value,
  onChange,
  disabled = false,
}: CharacterTypeSwitchProps) {
  const activeIndex = OPTIONS.findIndex((option) => option.value === value);
  const indicatorStyle = {
    transform: `translateX(${Math.max(activeIndex, 0) * 100}%)`,
  } satisfies CSSProperties;

  return (
    <div
      className={cn(s.root, [disabled ? s.rootDisabled : null])}
      role="tablist"
      aria-label="Character type"
    >
      <div className={s.indicator} style={indicatorStyle} aria-hidden="true" />
      {OPTIONS.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={cn(s.option, [isActive ? s.optionActive : null])}
            disabled={disabled}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
