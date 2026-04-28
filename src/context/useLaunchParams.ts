import { useContext } from 'react';

import { LaunchParamsContext } from './launch-params-context';

export function useLaunchParams() {
  const context = useContext(LaunchParamsContext);
  if (!context) {
    throw new Error('useLaunchParams must be used within LaunchParamsProvider');
  }
  return context.params;
}
