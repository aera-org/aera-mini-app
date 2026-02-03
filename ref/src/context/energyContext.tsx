import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';

import { useUser } from './userContext';
import { User } from '../types/user';
import { useThrottle } from '../hooks/useThrottle';
import { energyApi } from '../api/energy';
import { logger } from '../utils/logger';
import { trackRubbing } from '../utils/analytics';

export type BoostDeclineReason =
  | 'BOOST_ALREADY_ACTIVE'
  | 'NO_BOOSTS_REMAINING'
  | 'SERVER_ERROR'
  | null;

interface EnergyContextType {
  energy: number;
  maxEnergy: number;
  hasEnoughEnergy: (value?: number) => boolean;
  convertEnergy: (
    value: number,
    isBoostActive?: boolean,
    isUndressActive?: boolean
  ) => boolean;
  isBoostActive: boolean;
  isUndressActive: boolean;
  handleBoostAttempt: () => Promise<{
    success: boolean;
    reason?: BoostDeclineReason;
  }>;
}

const EnergyContext = createContext<EnergyContextType | undefined>(undefined);

export const EnergyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, setUser } = useUser();
  const [energy, setEnergy] = useState(0);
  const [maxEnergy, setMaxEnergy] = useState(0);

  const [isBoostActive, setIsBoostActive] = useState(false);
  const [isUndressActive, setIsUndressActive] = useState(false);

  const toSave = useRef({
    regular: 0,
    boost: 0,
    undress: 0,
  });

  const hasEnoughEnergy = useCallback(
    (value = 1) => {
      if (!user) return false;
      return energy > value;
    },
    [energy, user]
  );

  const throtledApiCall = useThrottle(async () => {
    try {
      trackRubbing(user?.data?.girl, {
        energy: user?.data?.energy?.value,
        boost_active: isBoostActive,
        undress_active: isUndressActive,
        regular_points: toSave.current.regular,
        boost_points: toSave.current.boost,
        undress_points: toSave.current.undress,
      });

      const response = await energyApi.convertEnergy(
        toSave.current.regular,
        toSave.current.boost,
        toSave.current.undress
      );

      toSave.current = {
        regular: 0,
        boost: 0,
        undress: 0,
      };

      const energy = response.energy;
      const amount = response.amount;

      if (user) {
        // Only update if values actually changed
        const hasJumpsChanged = user.jumps !== amount;
        const hasEnergyChanged =
          user.data.energy.value !== energy.value ||
          user.data.energy.lastUpdate !== energy.lastUpdate;

        if (hasJumpsChanged || hasEnergyChanged) {
          setUser({
            ...user,
            jumps: amount,
            data: {
              ...user.data,
              energy,
            },
          });
        }
      }
    } catch (error) {
      logger.error('Energy conversion failed', { error: String(error) });
      // Reset the counters on error to prevent accumulation
      toSave.current = {
        regular: 0,
        boost: 0,
        undress: 0,
      };
    }
  }, 10000);

  const convertEnergy = useCallback(
    (
      value: number,
      isBoostActive: boolean = false,
      isUndressActive: boolean = false
    ) => {
      if (!user) return false;

      if (!hasEnoughEnergy(value) && (!isBoostActive || !isUndressActive))
        return false;

      if (isUndressActive) {
        toSave.current.undress += value;
      } else if (isBoostActive) {
        toSave.current.boost += value;
      } else {
        toSave.current.regular += value;
      }

      const newJumps = (user.jumps || 0) + value;

      if (isBoostActive || isUndressActive) {
        // Only update jumps if actually changed
        if (user.jumps !== newJumps) {
          setUser({
            ...user,
            jumps: newJumps,
          });
        }
      } else {
        const newEnergyValue = energy - value;
        // Only update if energy or jumps changed
        if (
          user.jumps !== newJumps ||
          user.data.energy.value !== newEnergyValue
        ) {
          setUser({
            ...user,
            jumps: newJumps,
            data: {
              ...user.data,
              energy: {
                ...user.data.energy,
                lastUpdate: new Date().toISOString(),
                value: newEnergyValue,
              },
            },
          });
        }
      }

      throtledApiCall();
      return true;
    },
    [user, setUser, hasEnoughEnergy, energy, throtledApiCall]
  );
  useEffect(() => {
    //@ts-ignore
    const updateEnergy = (user: User) => {
      if (!user) return 0;

      const maxEnergy = getMaxEnergy(user);
      const time =
        new Date().getTime() - new Date(user.data.energy.lastUpdate).getTime();

      // one energy per 5 seconds
      const value = time / 1000;

      const newEnergy = Math.min(user.data.energy.value + value, maxEnergy);

      // Only update state if there's a meaningful change (at least 1 energy point)
      setEnergy((prevEnergy) => {
        const diff = Math.abs(prevEnergy - newEnergy);
        return diff >= 1 ? newEnergy : prevEnergy;
      });

      setMaxEnergy((prevMaxEnergy) => {
        return prevMaxEnergy !== maxEnergy ? maxEnergy : prevMaxEnergy;
      });
    };

    const getMaxEnergy = (user: User) => {
      if (!user) return 0;
      return 500; // * (user.data.assets.gym.level + 1);
    };

    if (!user) return;
    updateEnergy(user);
    // Reduce update frequency from 1000ms to 5000ms since energy regenerates every 5 seconds
    const interval = setInterval(() => updateEnergy(user), 5000);
    return () => clearInterval(interval);
  }, [user]);
  //@ts-ignore
  useEffect(() => {
    if (user?.data?.undressDate) {
      const undressDate = new Date(user.data.undressDate);

      // more than 1 minute
      if (undressDate.getTime() + 60000 - Date.now() > 0) {
        setIsUndressActive(true);
      } else {
        setIsUndressActive(false);
      }

      const timeout = setTimeout(() => {
        setIsUndressActive(false);
      }, undressDate.getTime() + 60000 - Date.now());

      return () => clearTimeout(timeout);
    }
  }, [user]);

  const handleBoostAttempt = useCallback(async () => {
    if (isBoostActive) {
      return { success: false, reason: 'BOOST_ALREADY_ACTIVE' };
    }
    if (!user) return { success: false };

    const resetDate = new Date(user.data.boost.resetAfter);
    const now = new Date();

    if (user.data.boost.value <= 0 && resetDate.getTime() > now.getTime()) {
      return { success: false, reason: 'NO_BOOSTS_REMAINING' };
    }

    try {
      const response = await energyApi.boostEnergy();

      if (response.ok) {
        setIsBoostActive(true);
        // Only update if boost data changed
        const boostChanged =
          user.data.boost.value !== response.boost.value ||
          user.data.boost.resetAfter !== response.boost.resetAfter;

        if (boostChanged) {
          setUser({
            ...user,
            data: {
              ...user.data,
              boost: response.boost,
            },
          });
        }

        setTimeout(() => {
          setIsBoostActive(false);
        }, 60000);

        return { success: true };
      } else {
        return { success: false, reason: response.reason || 'SERVER_ERROR' };
      }
    } catch (error) {
      return { success: false, reason: 'SERVER_ERROR' };
    }
  }, [isBoostActive, setIsBoostActive, user, setUser]);

  return (
    <EnergyContext.Provider
      value={{
        energy,
        maxEnergy,
        hasEnoughEnergy,
        convertEnergy,
        isBoostActive,
        isUndressActive,
        handleBoostAttempt: handleBoostAttempt as () => Promise<{
          success: boolean;
          reason?: BoostDeclineReason;
        }>,
      }}
    >
      {children}
    </EnergyContext.Provider>
  );
};

export const useEnergy = () => {
  const context = useContext(EnergyContext);
  if (!context) {
    throw new Error('useEnergy must be used within an EnergyProvider');
  }
  return context;
};
