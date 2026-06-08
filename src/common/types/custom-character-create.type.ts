import type {
  CharacterBodyType,
  CharacterBreastSize,
  CharacterEthnicity,
  CharacterEyeColor,
  CharacterHairColor,
  CharacterHairStyle,
  CharacterPersonality,
  CharacterType,
} from './character.type';

export type CustomCharacterDraft = {
  name: string;
  age?: number;
  type?: CharacterType;
  personality: CharacterPersonality[];
  ethnicity?: CharacterEthnicity;
  hairColor?: CharacterHairColor;
  hairStyle?: CharacterHairStyle;
  eyeColor?: CharacterEyeColor;
  bodyType?: CharacterBodyType;
  breastSize?: CharacterBreastSize;
};

export type CustomCharacterCreateRouteState = {
  source: 'custom-character-create';
  draft: CustomCharacterDraft;
  returnStep: 'review';
  autoCreateAfterPurchase: boolean;
  purchaseCompleted?: boolean;
};
