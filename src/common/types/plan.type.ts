export enum PlanPeriod {
  Day = 'day',
  Month = 'month',
  Year = 'year',
}

export enum PlanType {
  Subscription = 'subscription',
  Air = 'air',
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
}
