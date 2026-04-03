export enum CharacterType {
  Realistic = 'realistic',
  Anime = 'anime',
}

export function isCharacterType(value: string): value is CharacterType {
  return value === CharacterType.Realistic || value === CharacterType.Anime;
}

export interface ICharacter {
  id: string;
  name: string;
  description: string;
  avatarUrl: string;
  promoImgUrl?: string;
  emoji: string;
  isFeatured: boolean;
  scenarios: IScenario[];
  type: CharacterType;
}

export interface IScenario {
  id: string;
  slug?: string;
  name: string;
  description: string;
  shortDescription: string;
  isActive: boolean;
  promoImgUrl: string;
  promoImgHorizontalUrl: string;
  isNew: boolean;
  createdAt: string;
}
