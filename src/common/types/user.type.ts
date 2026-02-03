export interface ITgUser {
  id: string;
  fuel: number;
  air: number;
  languageCode: string;
  subscribedUntil?: string | null;
  gifts: string[];
}
