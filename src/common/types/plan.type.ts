export enum PlanPeriod {
  Day = 'day',
  Month = 'month',
  Year = 'year',
}

export enum PlanType {
  Subscription = 'subscription',
  Air = 'air',
}

export interface IPlan {
  id: string;
  type: PlanType;
  period?: PlanPeriod;
  periodCount?: number;
  price: number;
  isRecommended: boolean;
  air: number;
}
