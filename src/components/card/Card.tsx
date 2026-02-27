import type { CSSProperties, HTMLAttributes } from 'react';

import { cn } from '@/common/utils';

import s from './Card.module.scss';

type CardVariant = 'neutral' | 'accent';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
  backgroundImage?: string;
};

export function Card({
  children,
  className,
  variant = 'neutral',
  backgroundImage,
  style,
  ...props
}: CardProps) {
  const styles: CSSProperties | undefined = backgroundImage
    ? ({
        ...style,
        '--card-bg-image': `url(${backgroundImage})`,
      } as CSSProperties)
    : style;

  return (
    <div className={cn(s.card, [s[variant], className])} style={styles} {...props}>
      {children}
    </div>
  );
}
