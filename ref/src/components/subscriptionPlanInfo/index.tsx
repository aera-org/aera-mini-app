import { FC } from 'react';
import { useUser } from '../../context/userContext';
import { Text } from '../text';
import s from './index.module.css';

export const SubscriptionPlanInfo: FC = () => {
  const { user } = useUser();

  const isSubscriptionActive =
    user?.subscription_expires_at &&
    new Date(user.subscription_expires_at) > new Date();

  const getPlanName = () => {
    if (isSubscriptionActive) {
      return 'Premium';
    }
    return 'Free';
  };

  return (
    <div className={s.container}>
      <div className={s.planInfo}>
        <Text variant="span" className={s.planLabel}>
          Your plan
        </Text>
        <div className={s.divider} />
        <Text variant="h2" className={s.planName}>
          {getPlanName()}
        </Text>
      </div>
    </div>
  );
};
