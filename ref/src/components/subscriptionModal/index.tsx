import { FC } from 'react';
import { useUser } from '@/context/userContext';
import { useCurrency } from '../../hooks/useCurrency';
import { Text } from '../text';
import { Button } from '../button';
import Modal from '../modal';
import s from './index.module.css';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBuy: () => void;
  price: number;
}

const SubscriptionModal: FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onBuy,
  price,
}) => {
  const { user } = useUser();
  const { namePrefixed } = useCurrency();

  const isSubscriptionActive =
    user?.subscription_expires_at &&
    new Date(user.subscription_expires_at) > new Date();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={s.container}>
        <Text variant="h1" className={s.title}>
          Subscription
        </Text>
        {isSubscriptionActive ? (
          <div className={s.activeSubscription}>
            <Text>
              Subscription is active until:{' '}
              {new Date(
                user?.subscription_expires_at || ''
              ).toLocaleDateString()}
            </Text>
          </div>
        ) : (
          <>
            <ul className={s.features}>
              <li>Unlimited messages</li>
              <li>15000 Al fuel</li>
              <li>300 NSFW photos</li>
              <li>5000000 {namePrefixed}</li>
              <li>Advanced roleplay</li>
              <li>1-Month Access</li>
            </ul>
            <Button
              className={s.buyButton}
              onClick={onBuy}
              label={
                <div className={s.buttonContent}>
                  <span className={s.star}>★</span>
                  <Text variant="h3" color="white">
                    {price}
                  </Text>
                </div>
              }
            />
          </>
        )}
      </div>
    </Modal>
  );
};

export default SubscriptionModal;
