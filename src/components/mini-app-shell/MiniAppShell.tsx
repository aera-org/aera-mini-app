import TelegramWebApp from '@twa-dev/sdk';
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
      const viewportHeight = TelegramWebApp.viewportHeight;
      const height =
        typeof viewportHeight === 'number' && viewportHeight > 0
          ? viewportHeight
          : window.innerHeight;
      const vh = height * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      document.documentElement.style.setProperty(
        '--app-height',
        `${height}px`
      );
    };

    TelegramWebApp.expand();
    setVh();
    window.addEventListener('resize', setVh);
    TelegramWebApp.onEvent('viewportChanged', setVh);
    return () => {
      window.removeEventListener('resize', setVh);
      TelegramWebApp.offEvent('viewportChanged', setVh);
    };
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
