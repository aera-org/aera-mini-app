export enum Language {
  EN = 'en',
  Ru = 'ru',
  Es = 'es',
  Fr = 'fr',
  De = 'de',
  It = 'it',
  Pl = 'pl',
}

export interface IUser {
  id: string;
  fuel: number;
  air: number;
  languageUI: Language;
  languageCode: string;
  subscribedUntil?: string | null;
  hasActiveChat: boolean
  createdAt: string;
}
