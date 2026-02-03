import { FC } from 'react';
import { Text } from '../text';
import { Button } from '../button';
import Modal from '../modal';
import { useBoost } from '../../context/boostContext';
import s from './index.module.css';
import { logger } from '../../utils/logger';
import { formatTime } from '../../utils/time';

const NotEnoughBoostsModal: FC = () => {
  const { isBoostModalOpen, hideBoostModal, waitTime, price, buyBoost } =
    useBoost();
  const waitTimeString = waitTime ? formatTime(waitTime) : '24:00:00';

  const handleBuyButtonClick = async () => {
    try {
      await buyBoost();
      hideBoostModal();
    } catch (error) {
      logger.error('Failed to buy boost', { error: String(error) });
    }
  };

  return (
    <Modal isOpen={isBoostModalOpen} onClose={hideBoostModal}>
      <div className={s.container}>
        <Text variant="h1" className={s.title || ''}>
          Oh no!
        </Text>
        <Text variant="h2" className={s.subtitle || ''}>
          The boosts is over
        </Text>
        <Text variant="span" className={s.waitText || ''}>
          Wait for {waitTimeString}
          <br />
          or refill now:
        </Text>
        <Button
          className={s.buyButton || ''}
          onClick={handleBuyButtonClick}
          label={
            <div className={s.buttonContent}>
              <span className={s.star}>★</span>
              <Text variant="h3" color="white">
                {price}
              </Text>
            </div>
          }
        />
        <Button
          className={s.waitButton || ''}
          onClick={hideBoostModal}
          label={<Text variant="span">Wait</Text>}
        />
      </div>
    </Modal>
  );
};

export default NotEnoughBoostsModal;
