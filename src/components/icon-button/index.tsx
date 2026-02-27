import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@/common/utils';

import s from './index.module.css';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function IconButton({
  children,
  className,
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button type={type} className={cn(s.button, [className])} {...props}>
      {children}
    </button>
  );
}
