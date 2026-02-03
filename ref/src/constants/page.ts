export const PAGES = {
  HOME_PAGE: 'HomePage',
  GIFTS: 'Gifts',
  TASKS: 'Tasks',
  GUIDE: 'Guide',
  CHAT: 'Chat',
  GAME: 'Game',
  BAG: 'Bag',
  GIRLS: 'Girls',
  LOADING: 'Loading',
  ERROR: 'Error',
  LEADER_BOARD: 'Leader Board',
  REFERRALS: 'Referrals',
  SUBSCRIPTION: 'Subscription',
};

export const CATEGORY_GUIDE = {
  AI_FUEL: 'AI Fuel',
  JUMPS: 'Jumps',
  STATUS: 'Status',
  STORE: 'Store',
  GIFTS: 'Gifts',
  BAG: 'Bag',
  TASKS: 'Tasks',
  ENERGY: 'Energy',
  AI_WORLD: 'AI World',
  REFERRALS: 'Referrals',
  LEADER_BOARD: 'Leader Board',
};

export const shortenHash = (hash: string, length = 4) => {
  if (hash.length <= length * 2 + 3) {
    return hash;
  }

  const start = hash.slice(0, length);
  const end = hash.slice(-length);

  return `${start}...${end}`;
};
