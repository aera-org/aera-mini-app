declare global {
  const Telegram: {
    WebApp: {
      platform: string;
      HapticFeedback: {
        impactOccurred: (
          style: 'light' | 'medium' | 'heavy' | 'soft' | 'rigid'
        ) => void;
      };
    };
  };
}

export {};
