import { createContext } from 'react';

import type { LaunchParams } from '@/common/types';

export type LaunchParamsContextValue = {
  params: LaunchParams;
};

export const LaunchParamsContext = createContext<
  LaunchParamsContextValue | undefined
>(undefined);
