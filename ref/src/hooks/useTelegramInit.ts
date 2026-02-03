import { useEffect } from 'react';

import TelegramWebApp from '@twa-dev/sdk';

export const useTelegramInit = () => {
  useEffect(() => {
    // Initialize the Telegram WebApp
    if (TelegramWebApp.isVersionAtLeast('6.2')) {
      TelegramWebApp.expand();
      TelegramWebApp.enableClosingConfirmation();
    }

    if (TelegramWebApp.isVersionAtLeast('7.7')) {
      TelegramWebApp.disableVerticalSwipes();
    }
  }, []);
};
