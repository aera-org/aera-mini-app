import type { TFunction } from 'i18next';

import { type IPlan, PlanPeriod } from '@/common/types';

const periodOrder: Record<PlanPeriod, number> = {
  [PlanPeriod.Day]: 0,
  [PlanPeriod.Month]: 1,
  [PlanPeriod.Year]: 2,
};

export function comparePlansByPeriod(a: IPlan, b: IPlan): number {
  const orderA = a.period ? periodOrder[a.period] : 0;
  const orderB = b.period ? periodOrder[b.period] : 0;
  const orderDiff = orderA - orderB;
  if (orderDiff !== 0) return orderDiff;
  return (a.periodCount ?? 0) - (b.periodCount ?? 0);
}

export function formatPlanPeriod(plan: IPlan, t: TFunction) {
  if (!plan.period) return '';
  return t(`bag.periods.${plan.period}`, { count: plan.periodCount ?? 1 });
}
