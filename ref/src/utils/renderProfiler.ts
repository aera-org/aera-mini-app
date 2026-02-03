import React from 'react';

// Utility for tracking React component re-renders in development
export const createRenderLogger = (componentName: string) => {
  let renderCount = 0;
  let lastRenderTime = Date.now();
  let lastReason = '';

  return {
    logRender: (reason?: string) => {
      if (process.env.NODE_ENV === 'development') {
        renderCount++;
        const currentTime = Date.now();
        const timeSinceLastRender = currentTime - lastRenderTime;
        
        // Only log if it's been more than 100ms since last render or reason changed
        // This prevents spam from rapid re-renders
        if (timeSinceLastRender > 100 || reason !== lastReason) {
          console.log(
            `🔄 [${componentName}] Render #${renderCount}`,
            reason ? `- Reason: ${reason}` : '',
            `- Time since last: ${timeSinceLastRender}ms`
          );
          lastReason = reason || '';
        }
        
        lastRenderTime = currentTime;
      }
    },

    logProps: (props: Record<string, any>) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`📊 [${componentName}] Props:`, props);
      }
    },

    getRenderCount: () => renderCount,
  };
};

// Hook to track component re-renders
export const useRenderTracker = (componentName: string, deps?: any[]) => {
  const renderLogger = createRenderLogger(componentName);

  React.useEffect(() => {
    renderLogger.logRender(
      deps ? `Dependencies changed: ${JSON.stringify(deps)}` : 'Initial render'
    );
  }, deps);

  return renderLogger;
};

// React DevTools Profiler wrapper
export const ProfilerWrapper: React.FC<{
  id: string;
  children: React.ReactNode;
}> = ({ id, children }) => {
  const onRender = (
    id: string,
    phase: 'mount' | 'update' | 'nested-update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ [Profiler-${id}] ${phase}`, {
        actualDuration: `${actualDuration.toFixed(2)}ms`,
        baseDuration: `${baseDuration.toFixed(2)}ms`,
        startTime,
        commitTime,
      });
    }
  };

  return React.createElement(React.Profiler, { id, onRender }, children);
};
