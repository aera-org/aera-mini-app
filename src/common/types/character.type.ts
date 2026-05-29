export enum CharacterType {
  Realistic = 'realistic',
  Anime = 'anime',
}

export function isCharacterType(value: string): value is CharacterType {
  return value === CharacterType.Realistic || value === CharacterType.Anime;
}

export enum CharacterBodyType {
  Skinny = 'skinny',
  Athletic = 'athletic',
  Average = 'average',
  Curvy = 'curvy',
  Bbw = 'bbw',
}

export enum CharacterBreastSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  ExtraLarge = 'extraLarge',
}

export enum CharacterHairColor {
  Blond = 'blond',
  Brunette = 'brunette',
  Redhead = 'redhead',
  Black = 'black',
  Pink = 'pink',
}

export enum CharacterEthnicity {
  Caucasian = 'caucasian',
  Arabian = 'arabian',
  Latina = 'latina',
  Asian = 'asian',
  Afro = 'afro',
  Indian = 'indian',
}

export enum CharacterPersonality {
  Hot = 'hot',
  Submissive = 'submissive',
  Dominant = 'dominant',
  Shy = 'shy',
  Caring = 'caring',
  Playful = 'playful',
  Sassy = 'sassy',
  Mysterious = 'mysterious',
  Romantic = 'romantic',
  Intellectual = 'intellectual',
}

export enum CharacterHairStyle {
  Straight = 'straight',
  Bangs = 'bangs',
  Curly = 'curly',
  Bun = 'bun',
  Short = 'short',
  Ponytail = 'ponytail',
}

export enum CharacterEyeColor {
  Brown = 'brown',
  Blue = 'blue',
  Green = 'green',
}

export enum CustomCharacterStatus {
  InProgress = 'in_progress',
  Completed = 'completed',
  Failed = 'failed',
}

export interface ICharacter {
  id: string;
  name: string;
  personality: CharacterPersonality[];
  description: string;
  avatarUrl: string;
  promoImgUrl?: string;
  emoji: string;
  isFeatured: boolean;
  scenarios: IScenario[];
  type: CharacterType;
}

export enum RoleplayStage {
  Acquaintance = 'ACQUAINTANCE',
  Flirting = 'FLIRTING',
  Seduction = 'SEDUCTION',

  Resistance = 'RESISTANCE',

  Undressing = 'UNDRESSING',
  Prelude = 'PRELUDE',
  Sex = 'SEX',
  Aftercare = 'AFTERCARE',
}

export const STAGE_TO_INDEX: Record<RoleplayStage, number> = {
  [RoleplayStage.Acquaintance]: 0,
  [RoleplayStage.Flirting]: 1,
  [RoleplayStage.Seduction]: 2,
  [RoleplayStage.Resistance]: 3,
  [RoleplayStage.Undressing]: 4,
  [RoleplayStage.Prelude]: 5,
  [RoleplayStage.Sex]: 6,
  [RoleplayStage.Aftercare]: 7,
} as const;

export interface IScenarioProgress {
  id: string;
  opensAt: string;
  maxStage: RoleplayStage;
}

export interface IScenario {
  id: string;
  slug?: string;
  name: string;
  level: number;
  description: string;
  shortDescription: string;
  isActive: boolean;
  isTop: boolean;
  promoImgUrl: string;
  promoImgHorizontalUrl: string;
  openingImageUrl?: string;
  isNew: boolean;
  createdAt: string;
  opensAfterId?: string;
  scenarioProgress?: IScenarioProgress;
}

export interface CustomCharacterCreateDto {
  name: string;
  age: number;
  personality: CharacterPersonality[];
  hairColor: CharacterHairColor;
  ethnicity: CharacterEthnicity;
  bodyType: CharacterBodyType;
  hairStyle: CharacterHairStyle;
  eyeColor: CharacterEyeColor;
  breastSize: CharacterBreastSize;
  type: CharacterType;
}

export interface CustomScenarioCreateDto {
  description: string;
  lingerie: string;
  clothes: string;
}
