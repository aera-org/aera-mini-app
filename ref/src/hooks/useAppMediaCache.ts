import { useImageCache } from './useImageCache';
import { useMemo } from 'react';

// Bg
import GuideBG from '../assets/backgrounds/guideBG.webp';

import { icons } from '../assets/icons';

export const backgroundImages = {
  Bag: GuideBG,
  Store: GuideBG,
  Tasks: GuideBG,
  Gifts: GuideBG,
  Guide: GuideBG,
  LeaderBoard: GuideBG,
  Referrals: GuideBG,
};

export type GirlName = 'Electra' | 'Angel' | 'Eliza' | 'Olivia';

export type VideoType = 'undress' | 'idle' | 'rub';

export type GirlVideos = Record<VideoType, string>;

export const girlVideos: Record<GirlName, GirlVideos> = {
  Electra: {
    undress: 'https://cdn.bubblejump.ai/Electra/dance.mp4',
    idle: 'https://cdn.bubblejump.ai/Electra/idle.mp4',
    rub: 'https://cdn.bubblejump.ai/Electra/rub.mp4',
  },
  Angel: {
    undress: 'https://cdn.bubblejump.ai/Angel/dance.mp4',
    idle: 'https://cdn.bubblejump.ai/Angel/idle.mp4',
    rub: 'https://cdn.bubblejump.ai/Angel/rub.mp4',
  },
  Olivia: {
    undress: 'https://cdn.bubblejump.ai/Olivia/dance.mp4',
    idle: 'https://cdn.bubblejump.ai/Olivia/idle.mp4',
    rub: 'https://cdn.bubblejump.ai/Olivia/rub.mp4',
  },
  Eliza: {
    undress: 'https://cdn.bubblejump.ai/Eliza/dance.mp4',
    idle: 'https://cdn.bubblejump.ai/Eliza/idle.mp4',
    rub: 'https://cdn.bubblejump.ai/Eliza/rub.mp4',
  },
};

export function useAppMediaCache() {
  const bagCache = useImageCache(backgroundImages.Bag);
  const storeCache = useImageCache(backgroundImages.Store);
  const tasksCache = useImageCache(backgroundImages.Tasks);
  const giftsCache = useImageCache(backgroundImages.Gifts);
  const guideCache = useImageCache(backgroundImages.Guide);

  const ballCache = useImageCache(icons.ball);
  const heartCache = useImageCache(icons.heart);
  const questionCache = useImageCache(icons.question);
  const walletCache = useImageCache(icons.wallet);
  const whiteArrowCache = useImageCache(icons.whiteArrow);
  const fuelCache = useImageCache(icons.fuel);
  const ballModalCache = useImageCache(icons.ballModal);
  const bagIconCache = useImageCache(icons.bag);
  const chatCache = useImageCache(icons.chat);
  const giftsIconCache = useImageCache(icons.gifts);
  const tasksIconCache = useImageCache(icons.tasks);
  const planeCache = useImageCache(icons.plane);
  const whiteRightArrowCache = useImageCache(icons.whiteRightArrow);
  const successCache = useImageCache(icons.success);
  const whiteEnergyCache = useImageCache(icons.whiteEnergy);
  const whiteStarCache = useImageCache(icons.whiteStar);
  const bigFuelCache = useImageCache(icons.bigFuel);
  const greyHeartCache = useImageCache(icons.greyHeart);
  const energyCache = useImageCache(icons.energy);
  const earthCache = useImageCache(icons.earth);
  const oliviaIconCache = useImageCache(icons.olivia);
  const angelIconCache = useImageCache(icons.angel);
  const electraIconCache = useImageCache(icons.electra);
  const elizaIconCache = useImageCache(icons.eliza);
  const messageIconCache = useImageCache(icons.messageIcon);
  const greenCheckCache = useImageCache(icons.greenCheck);
  const storeItemCache = useImageCache(icons.storeItem);
  const loadingIconCache = useImageCache(icons.loadingIcon);
  const telegramLinkCache = useImageCache(icons.telegramLink);
  const xLinkCache = useImageCache(icons.xLink);
  const closeCache = useImageCache(icons.close);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allImageCaches = [
    bagCache,
    storeCache,
    tasksCache,
    giftsCache,
    guideCache,
    ballCache,
    heartCache,
    questionCache,
    walletCache,
    whiteArrowCache,
    fuelCache,
    ballModalCache,
    bagIconCache,
    chatCache,
    giftsIconCache,
    tasksIconCache,
    planeCache,
    whiteRightArrowCache,
    successCache,
    whiteEnergyCache,
    whiteStarCache,
    bigFuelCache,
    greyHeartCache,
    energyCache,
    earthCache,
    oliviaIconCache,
    angelIconCache,
    electraIconCache,
    elizaIconCache,
    messageIconCache,
    greenCheckCache,
    storeItemCache,
    loadingIconCache,
    telegramLinkCache,
    xLinkCache,
    closeCache,
  ];

  return useMemo(
    () => ({
      images: {
        isCached: allImageCaches.every((cache) => cache.isCached),
        isLoading: allImageCaches.some((cache) => cache.isLoading),
        error: allImageCaches.find((cache) => cache.error)?.error,
        ball: icons.ball,
        heart: icons.heart,
        question: icons.question,
        wallet: icons.wallet,
        whiteArrow: icons.whiteArrow,
        fuel: icons.fuel,
        ballModal: icons.ballModal,
        bag: icons.bag,
        chat: icons.chat,
        gifts: icons.gifts,
        tasks: icons.tasks,
        plane: icons.plane,
        whiteRightArrow: icons.whiteRightArrow,
        success: icons.success,
        whiteEnergy: icons.whiteEnergy,
        whiteStar: icons.whiteStar,
        bigFuel: icons.bigFuel,
        greyHeart: icons.greyHeart,
        energy: icons.energy,
        earth: icons.earth,
        olivia: icons.olivia,
        angel: icons.angel,
        electra: icons.electra,
        eliza: icons.eliza,
        messageIcon: icons.messageIcon,
        greenCheck: icons.greenCheck,
        storeItem: icons.storeItem,
        loadingIcon: icons.loadingIcon,
        telegramLink: icons.telegramLink,
        xLink: icons.xLink,
        close: icons.close,
        friends: icons.friends,
        league: icons.league,
      },
      isAllCached: allImageCaches.every((cache) => cache.isCached),
      isAnyLoading: allImageCaches.some((cache) => cache.isLoading),
      anyError: allImageCaches.find((cache) => cache.error)?.error,
    }),
    [allImageCaches]
  );
}
