import React from 'react';

import classNames from 'classnames';

import s from './index.module.css';

export interface ButtonProps {
  primary?: boolean;

  backgroundColor?: string;

  size?: 'small' | 'medium' | 'large';

  label: React.ReactNode;
  type?: 'circle' | 'text';
  className?: string | undefined;
  disabled?: boolean;

  onClick?: () => void;
  style?: React.CSSProperties;
}

export const Button = ({
  primary = false,
  size = 'small',
  backgroundColor,
  className,
  disabled = false,
  label,
  onClick,
  type: typeBtn = 'text',

  ...props
}: ButtonProps) => {
  const mode = primary ? s.primary : s.secondary;
  return (
    <button
      disabled={disabled}
      type="button"
      onClick={() => {
        if (onClick && !disabled) {
          onClick();
        }
      }}
      className={classNames(s.button, { [s[size] || '']: size }, mode, {
        [s[typeBtn] || '']: typeBtn,
        [className || '']: className,
      })}
      style={{ backgroundColor }}
      {...props}
    >
      {label}
    </button>
  );
};
