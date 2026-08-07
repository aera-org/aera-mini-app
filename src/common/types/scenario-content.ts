import type { IScenario } from './character.type';
import type { IUser } from './user.type';

export enum Explicitness {
  Sexy = 'sexy',
  Nudes = 'nudes',
  Explicit = 'explicit',
}

export const ExplicitnessLabels: Record<Explicitness, string> = {
  [Explicitness.Sexy]: 'Sensual',
  [Explicitness.Nudes]: 'Spicy',
  [Explicitness.Explicit]: 'XXX',
};

export enum ContentItemType {
  Image = 'image',
  Video = 'video',
}

export type MediaQuery = {
  explicitness?: Explicitness;
  skip?: number;
  take?: number;
};

export type Paginated<T> = {
  data: T[];
  total: number;
  skip: number;
  take: number;
};

export interface IScenarioMedia {
  id: string;
  url: string;
  previewUrl: string | null;
  type: ContentItemType;
  stage: number;
  isBlurred: boolean;
  createdAt: string;
}

export type ScenarioMediaTotals = {
  images: number;
  videos: number;
};

export interface IScenarioDetails extends IScenario {
  isUnlocked: boolean;
  character: NonNullable<IScenario['character']>;
}

export type UnlockScenarioResponse = {
  scenario?: IScenarioDetails;
  user?: IUser;
};

export type UnblurScenarioVideoResponse = {
  item?: IScenarioMedia;
  user?: IUser;
  video?: IScenarioMedia;
};

export const SCENARIO_CONTENT_PRICE = 300;
export const IMAGE_PRICE = 3;
export const VIDEO_PRICE = 15;
