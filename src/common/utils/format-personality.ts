import type { CharacterPersonality } from '@/common/types';

import { capitalize } from './capitalize';

export function formatPersonality(personality: CharacterPersonality[]) {
  const labels = personality.map((item) => capitalize(item));

  if (labels.length <= 1) {
    return labels[0] ?? '';
  }

  if (labels.length === 2) {
    return `${labels[0]} and ${labels[1]}`;
  }

  return `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`;
}
