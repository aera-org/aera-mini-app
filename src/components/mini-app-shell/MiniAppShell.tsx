import { useEffect } from 'react';

import { cn } from '@/common/utils';

type MiniAppShellProps = {
  children: React.ReactNode;
  className?: string;
  appClassName?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  background?: React.ReactNode;
};

export function MiniAppShell({
  children,
  className,
  appClassName,
  header,
  footer,
  background,
}: MiniAppShellProps) {
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      document.documentElement.style.setProperty(
        '--app-height',
        `${window.innerHeight}px`
      );
    };

    setVh();
    window.addEventListener('resize', setVh);
    return () => window.removeEventListener('resize', setVh);
  }, []);

  return (
    <div className={cn('app-container', [className])}>
      <div className={cn('app', [appClassName])}>
        {background ? <div className="bg">{background}</div> : null}
        {header}
        {children}
        {footer ? <div className="bottom-nav">{footer}</div> : null}
      </div>
    </div>
  );
}
