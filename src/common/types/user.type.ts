export interface IUser {
  id: string;
  fuel: number;
  air: number;
  languageCode: string;
  subscribedUntil?: string | null;
}
