import { useEffect } from 'react';
import { useUser } from '../context/userContext';
import { useBoost } from '../context/boostContext';

export function useBoostTimer() {
  const { user } = useUser();
  const { setWaitTime } = useBoost();

  // @ts-ignore
  useEffect(() => {
    if (user?.data.boost.resetAfter) {
      const updateWaitTime = () => {
        const resetAfterTime = new Date(user.data.boost.resetAfter).getTime();
        const currentTime = Date.now();
        const remainingTime = resetAfterTime - currentTime;
        setWaitTime(remainingTime > 0 ? remainingTime : 0);
      };

      updateWaitTime();
      const intervalId = setInterval(updateWaitTime, 1000);
      return () => clearInterval(intervalId);
    } else {
      setWaitTime(0);
    }
  }, [user?.data.boost.resetAfter, setWaitTime]);
}
