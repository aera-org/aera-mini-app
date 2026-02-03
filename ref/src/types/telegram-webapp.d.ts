interface TelegramWebApp {
  BackButton: {
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
  };
  HapticFeedback: {
    impactOccurred: (
      style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'
    ) => void;
  };
  platform: string;
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp;
  };
}
