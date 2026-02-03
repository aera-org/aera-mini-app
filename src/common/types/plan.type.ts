export enum PlanPeriod {
  Day = 'day',
  Month = 'month',
  Year = 'year',
}

export interface IPlan {
  id: string;
  period: PlanPeriod;
  periodCount: number;
  price: number;
  isRecommended: boolean;
  air: number;
}
