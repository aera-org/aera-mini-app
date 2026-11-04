import type { IGift } from './gift.type';

export enum PlanPeriod {
  Day = 'day',
  Month = 'month',
  Year = 'year',
}

export enum PlanType {
  Subscription = 'subscription',
  Air = 'air',
  Bundle = 'bundle',
}

export interface IPlanItem {
  emoji: string;
  value: string;
}

export interface IPlan {
  id: string;
  type: PlanType;
  period?: PlanPeriod;
  items?: IPlanItem[];
  periodCount?: number;
  price: number;
  isRecommended: boolean;
  air: number;
  bundle?: { gifts: string[]};
}

export interface IPlanBundles {
  plans: IPlan[];
  gifts: IGift[];
  expiresAt: string;
}
