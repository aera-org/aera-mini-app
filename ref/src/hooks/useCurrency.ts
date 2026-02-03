import { useMemo, useSyncExternalStore } from 'react';
import ballIcon from '../assets/icons/ball.png';
import airIcon from '../assets/icons/air.png';
import ballLoadingIcon from '../assets/loading/loadingIcon.png';
import ballHeaderIcon from '../assets/header/ball.png';
import aeraLoadingBG from '../assets/backgrounds/aera-loading.jpg';

interface CurrencyConfig {
  icon: string;
  loadingIcon: string;
  headerIcon: string;
  name: string;
  nameUppercase: string;
  namePrefixed: string;
  displayName: string;
  animationClass: string;
  loadingBackground?: string;
  showLoadingIcon?: boolean;
  showLoadingText?: boolean;
  showLoadingLinks?: boolean;
}

// Subscribe to sessionStorage changes for the activeBotId
const subscribe = (callback: () => void) => {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
};

const getActiveBotId = () => {
  if (typeof window === 'undefined') return 'aera';

  // Try sessionStorage first (faster)
  const stored = sessionStorage.getItem('activeBotId');
  if (stored) return stored;

  // Fallback to URL (fixes race condition on initial load)
  const urlParam = new URLSearchParams(window.location.search).get('aera');
  return urlParam || 'aera';
};

export const useCurrency = (): CurrencyConfig => {
  // Use useSyncExternalStore to reactively track sessionStorage changes
  const botId = useSyncExternalStore(subscribe, getActiveBotId, () => 'aera');

  return useMemo(() => {
    if (botId === 'main') {
      return {
        icon: ballIcon,
        loadingIcon: ballLoadingIcon,
        headerIcon: ballHeaderIcon,
        name: 'Jumps',
        nameUppercase: 'JUMPS',
        namePrefixed: '$JUMPS',
        displayName: 'Bubble Jump',
        animationClass: 'ball',
      };

    }

    // Default for 'aera' and any other bot
    return {
      icon: airIcon,
      loadingIcon: airIcon,
      headerIcon: airIcon,
      name: 'Air',
      nameUppercase: 'AIR',
      namePrefixed: '$AIR',
      displayName: 'Aera',
      animationClass: 'air',
      loadingBackground: aeraLoadingBG,
      showLoadingIcon: false,
      showLoadingText: false,
      showLoadingLinks: false,
    };
  }, [botId]);
};
