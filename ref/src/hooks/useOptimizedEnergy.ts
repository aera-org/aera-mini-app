import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '../context/userContext';
import { User } from '../types/user';

interface EnergyState {
  current: number;
  max: number;
  lastUpdate: Date;
}

/**
 * Optimized energy hook that reduces re-renders by:
 * 1. Using local state for energy calculations
 * 2. Only updating user context when necessary
 * 3. Batching updates
 */
export const useOptimizedEnergy = () => {
  const { user, setUser } = useUser();
  const [localEnergy, setLocalEnergy] = useState<EnergyState>({
    current: 0,
    max: 500,
    lastUpdate: new Date(),
  });

  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdatesRef = useRef<number>(0);

  // Calculate current energy based on time passed
  const calculateCurrentEnergy = useCallback((user: User): number => {
    if (!user?.data?.energy) return 0;

    const timePassed =
      Date.now() - new Date(user.data.energy.lastUpdate).getTime();
    const energyRegenerated = Math.floor(timePassed / 5000); // 1 energy per 5 seconds
    const maxEnergy = 500; // Could be calculated from gym level

    return Math.min(user.data.energy.value + energyRegenerated, maxEnergy);
  }, []);

  // Update local energy state
  useEffect(() => {
    if (!user) return;

    const currentEnergy = calculateCurrentEnergy(user);
    setLocalEnergy({
      current: currentEnergy,
      max: 500,
      lastUpdate: new Date(),
    });

    // Update every 5 seconds (energy regen rate) instead of every second
    const interval = setInterval(() => {
      const newEnergy = calculateCurrentEnergy(user);
      setLocalEnergy((prev) => ({
        ...prev,
        current: newEnergy,
        lastUpdate: new Date(),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [user, calculateCurrentEnergy]);

  // Optimized energy consumption with batched updates
  const consumeEnergy = useCallback(
    (amount: number = 1) => {
      if (!user || localEnergy.current < amount) return false;

      // Update local state immediately for UI responsiveness
      setLocalEnergy((prev) => ({
        ...prev,
        current: Math.max(prev.current - amount, 0),
      }));

      // Accumulate pending updates
      pendingUpdatesRef.current += amount;

      // Debounce user context updates
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      updateTimeoutRef.current = setTimeout(() => {
        const totalConsumed = pendingUpdatesRef.current;
        pendingUpdatesRef.current = 0;

        // Update user context with accumulated changes
        setUser({
          ...user,
          data: {
            ...user.data,
            energy: {
              ...user.data.energy,
              value: Math.max(user.data.energy.value - totalConsumed, 0),
              lastUpdate: new Date().toISOString(),
            },
          },
        });
      }, 1000); // Batch updates every second

      return true;
    },
    [user, localEnergy.current, setUser]
  );

  // Check if user has enough energy
  const hasEnoughEnergy = useCallback(
    (amount: number = 1) => {
      return localEnergy.current >= amount;
    },
    [localEnergy.current]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  return {
    energy: localEnergy.current,
    maxEnergy: localEnergy.max,
    hasEnoughEnergy,
    consumeEnergy,
  };
};
